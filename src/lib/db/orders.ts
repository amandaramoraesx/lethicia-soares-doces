import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { getProductsByIds, decrementProductStock } from "@/lib/db/products";
import { getIngredientsByIds, decrementIngredientStock } from "@/lib/db/ingredients";
import { findOrCreateCustomerByPhone, adjustCustomerFiadoBalance, createFiadoEntry } from "@/lib/db/customers";
import { createFinancialEntry, createReceivable } from "@/lib/db/financial";
import type { ProfitReportResult } from "@/lib/db/financial";

const collection = () => adminDb.collection("orders");

export async function listOrders(): Promise<Order[]> {
  const snap = await collection().orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
}

export async function getOrder(id: string): Promise<Order | null> {
  const doc = await collection().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await collection().doc(id).update({ status });
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryType: Order["deliveryType"];
  address: string;
  paymentMethod: Order["paymentMethod"];
  notes: string;
  items: OrderItem[];
  deliveryFee: number;
  source: Order["source"];
}

async function deductStockForItems(items: OrderItem[]): Promise<void> {
  const products = await getProductsByIds(items.map((item) => item.productId));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const ingredientUsage = new Map<string, number>();
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    if (product.stockControl) {
      await decrementProductStock(product.id, item.quantity);
    }

    for (const recipeItem of product.recipe ?? []) {
      const used = recipeItem.quantity * item.quantity;
      ingredientUsage.set(
        recipeItem.ingredientId,
        (ingredientUsage.get(recipeItem.ingredientId) ?? 0) + used
      );
    }
  }

  for (const [ingredientId, quantity] of ingredientUsage) {
    await decrementIngredientStock(ingredientId, quantity);
  }
}

async function settleOrderFinancials(order: Order, customerId: string | null): Promise<void> {
  if (order.paymentMethod === "fiado" && customerId) {
    const receivableId = await createReceivable({
      customerId,
      customerName: order.customerName,
      orderId: order.id,
      originalAmount: order.total,
      paidAmount: 0,
      status: "aberta",
      createdAt: new Date().toISOString(),
    });
    await createFiadoEntry({
      customerId,
      type: "venda",
      amount: order.total,
      date: new Date().toISOString(),
      note: `Pedido #${order.id.slice(0, 6)}`,
      orderId: order.id,
      receivableId,
    });
    await adjustCustomerFiadoBalance(customerId, order.total);
  } else {
    await createFinancialEntry({
      type: "entrada",
      categoryId: "vendas",
      categoryName: order.source === "cardapio" ? "Venda cardápio" : "Venda balcão",
      description: `Pedido #${order.id.slice(0, 6)}`,
      amount: order.total,
      date: new Date().toISOString(),
      orderId: order.id,
      customerId,
    });
  }
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Pedidos do cardápio público entram como "aguardando" até a loja aceitar; a taxa de
  // entrega só é definida nesse momento (deliveryFeePending fica true até lá). Pedidos
  // manuais (registrados pela própria loja) já chegam confirmados, com a taxa já conhecida.
  const isManual = input.source === "manual";
  const deliveryFee = input.deliveryType === "entrega" ? input.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  let customerId: string | null = null;
  if (input.customerPhone) {
    customerId = await findOrCreateCustomerByPhone(
      input.customerName,
      input.customerPhone,
      input.address
    );
  }

  const orderData: Omit<Order, "id"> = {
    createdAt: new Date().toISOString(),
    status: isManual ? "recebido" : "aguardando",
    customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryType: input.deliveryType,
    address: input.address,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    items: input.items,
    subtotal,
    deliveryFee,
    deliveryFeePending: !isManual && input.deliveryType === "entrega",
    total,
    source: input.source,
    rejectionReason: null,
  };

  const ref = collection().doc();
  await ref.set(orderData);

  // Baixa de estoque e lançamento financeiro só acontecem quando o pedido é confirmado
  // (na criação, para pedidos manuais; em acceptOrder, para pedidos do cardápio).
  if (isManual) {
    await deductStockForItems(input.items);
    await settleOrderFinancials({ ...orderData, id: ref.id }, customerId);
  }

  return ref.id;
}

export async function acceptOrder(id: string, deliveryFee: number | null): Promise<void> {
  const order = await getOrder(id);
  if (!order || order.status !== "aguardando") return;

  const finalDeliveryFee = order.deliveryType === "entrega" ? deliveryFee ?? order.deliveryFee : 0;
  const total = order.subtotal + finalDeliveryFee;
  const updated: Order = {
    ...order,
    status: "recebido",
    deliveryFee: finalDeliveryFee,
    deliveryFeePending: false,
    total,
  };

  await collection().doc(id).update({
    status: "recebido",
    deliveryFee: finalDeliveryFee,
    deliveryFeePending: false,
    total,
  });

  await deductStockForItems(order.items);
  await settleOrderFinancials(updated, order.customerId);
}

export async function rejectOrder(id: string, reason: string): Promise<void> {
  const order = await getOrder(id);
  if (!order || order.status !== "aguardando") return;

  await collection().doc(id).update({
    status: "cancelado",
    rejectionReason: reason || null,
  });
}

export async function computeProfitReport(fromISO: string, toISO: string): Promise<ProfitReportResult> {
  const allOrders = await listOrders();
  const orders = allOrders.filter(
    (o) => o.createdAt >= fromISO && o.createdAt <= toISO && o.status !== "cancelado"
  );

  const productIds = new Set<string>();
  for (const order of orders) {
    for (const item of order.items) productIds.add(item.productId);
  }
  const products = await getProductsByIds(Array.from(productIds));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const ingredientIds = new Set<string>();
  for (const product of products) {
    for (const recipeItem of product.recipe ?? []) ingredientIds.add(recipeItem.ingredientId);
  }
  const ingredients = await getIngredientsByIds(Array.from(ingredientIds));
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  let revenue = 0;
  let cogs = 0;
  for (const order of orders) {
    revenue += order.total;
    for (const item of order.items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      for (const recipeItem of product.recipe ?? []) {
        const ingredient = ingredientMap.get(recipeItem.ingredientId);
        if (!ingredient) continue;
        cogs += ingredient.costPerUnit * recipeItem.quantity * item.quantity;
      }
    }
  }

  const allEntries = await adminDb.collection("financialEntries").get();
  const expenses = allEntries.docs
    .map((doc) => doc.data())
    .filter((e) => e.type === "saida" && e.date >= fromISO && e.date <= toISO)
    .reduce((sum, e) => sum + (e.amount as number), 0);

  return {
    revenue,
    cogs,
    expenses,
    profit: revenue - cogs - expenses,
    ordersCount: orders.length,
  };
}
