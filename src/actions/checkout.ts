"use server";

import { z } from "zod";
import { createOrder } from "@/lib/db/orders";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Informe seu nome."),
  customerPhone: z.string().min(8, "Informe um telefone válido."),
  deliveryType: z.enum(["retirada", "entrega"]),
  address: z.string().default(""),
  paymentMethod: z.enum(["dinheiro", "pix", "cartao", "fiado"]),
  notes: z.string().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().min(0),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Seu carrinho está vazio."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrderAction(
  input: CheckoutInput
): Promise<{ orderId?: string; error?: string }> {
  const settings = await getStoreSettings();

  if (!isStoreOpenNow(settings)) {
    return { error: "Estamos fechados no momento. Tente novamente durante o horário de funcionamento." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  if (data.deliveryType === "entrega" && !data.address.trim()) {
    return { error: "Informe o endereço de entrega." };
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (subtotal < settings.minOrder) {
    return {
      error: `O pedido mínimo é de ${settings.minOrder.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}.`,
    };
  }

  const orderId = await createOrder({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryType: data.deliveryType,
    address: data.address,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    items: data.items,
    // A taxa de entrega é definida pela loja quando ela aceita o pedido — ver acceptOrder.
    deliveryFee: 0,
    source: "cardapio",
  });

  return { orderId };
}
