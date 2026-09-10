"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateOrderStatus, createOrder } from "@/lib/db/orders";
import { getProductsByIds } from "@/lib/db/products";
import type { OrderStatus } from "@/lib/types";

export async function updateOrderStatusAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as OrderStatus | undefined;
  if (!id || !status) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

const manualOrderSchema = z.object({
  customerName: z.string().min(1, "Informe o nome do cliente."),
  customerPhone: z.string().default(""),
  deliveryType: z.enum(["retirada", "entrega"]),
  address: z.string().default(""),
  paymentMethod: z.enum(["dinheiro", "pix", "cartao", "fiado"]),
  notes: z.string().default(""),
  deliveryFee: z.coerce.number().min(0).default(0),
});

export async function createManualOrderAction(formData: FormData) {
  const parsed = manualOrderSchema.parse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone") || "",
    deliveryType: formData.get("deliveryType"),
    address: formData.get("address") || "",
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes") || "",
    deliveryFee: formData.get("deliveryFee") || 0,
  });

  const itemsRaw = formData.get("items")?.toString() ?? "[]";
  const itemsInput = JSON.parse(itemsRaw) as Array<{ productId: string; quantity: number }>;
  const validItems = itemsInput.filter((item) => item.productId && item.quantity > 0);

  if (validItems.length === 0) {
    redirect("/admin/pedidos/novo?error=items");
  }

  const products = await getProductsByIds(validItems.map((i) => i.productId));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = validItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  await createOrder({ ...parsed, items, source: "manual" });

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  redirect("/admin/pedidos");
}
