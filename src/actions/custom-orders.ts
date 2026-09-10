"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCustomOrder, updateCustomOrder, deleteCustomOrder } from "@/lib/db/custom-orders";
import { getCustomer } from "@/lib/db/customers";

const customOrderSchema = z.object({
  customerId: z.string().default(""),
  doceName: z.string().min(1, "Informe o doce/bolo."),
  quantity: z.coerce.number().positive(),
  unit: z.enum(["un", "kg"]),
  deliveryDate: z.string().min(1, "Informe a data."),
  notes: z.string().default(""),
});

export async function saveCustomOrderAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = customOrderSchema.parse({
    customerId: formData.get("customerId") || "",
    doceName: formData.get("doceName"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    deliveryDate: formData.get("deliveryDate"),
    notes: formData.get("notes") || "",
  });

  const customer = parsed.customerId ? await getCustomer(parsed.customerId) : null;

  const data = {
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? "",
    doceName: parsed.doceName,
    quantity: parsed.quantity,
    unit: parsed.unit,
    deliveryDate: parsed.deliveryDate,
    notes: parsed.notes,
  };

  if (id) {
    await updateCustomOrder(id, data);
  } else {
    await createCustomOrder(data);
  }
  revalidatePath("/admin/encomendas");
  revalidatePath("/admin/clientes");
}

export async function markCustomOrderStatusAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();
  if (!id || !status) return;
  await updateCustomOrder(id, { status: status as "pendente" | "entregue" | "cancelada" });
  revalidatePath("/admin/encomendas");
  revalidatePath("/admin/clientes");
}

export async function deleteCustomOrderAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteCustomOrder(id);
  revalidatePath("/admin/encomendas");
  revalidatePath("/admin/clientes");
}
