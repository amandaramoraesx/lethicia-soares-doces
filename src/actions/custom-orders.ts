"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCustomOrder, updateCustomOrder, deleteCustomOrder } from "@/lib/db/custom-orders";
import { getCustomer } from "@/lib/db/customers";

const customOrderSchema = z.object({
  customerId: z.string().default(""),
  itemType: z.enum(["bolo", "docinho", "outro"]).default("outro"),
  doceName: z.string().default(""),
  recheioBolo1: z.string().default(""),
  recheioBolo2: z.string().default(""),
  massaBolo: z.string().default(""),
  tamanhoBolo: z.string().default(""),
  quantity: z.coerce.number().positive(),
  unit: z.enum(["un", "kg"]),
  deliveryDate: z.string().min(1, "Informe a data."),
  notes: z.string().default(""),
});

function composeBoloName(fields: {
  massaBolo: string;
  recheioBolo1: string;
  recheioBolo2: string;
  tamanhoBolo: string;
}): string {
  const recheios = [fields.recheioBolo1, fields.recheioBolo2].filter(Boolean).join(" + ");
  return `Bolo (massa ${fields.massaBolo}) — ${recheios} — Tamanho ${fields.tamanhoBolo}`;
}

function composeDocinhoName(sabores: string[]): string {
  return `Docinhos — ${sabores.join(", ")}`;
}

export async function saveCustomOrderAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = customOrderSchema.parse({
    customerId: formData.get("customerId") || "",
    itemType: formData.get("itemType") || "outro",
    doceName: formData.get("doceName") || "",
    recheioBolo1: formData.get("recheioBolo1") || "",
    recheioBolo2: formData.get("recheioBolo2") || "",
    massaBolo: formData.get("massaBolo") || "",
    tamanhoBolo: formData.get("tamanhoBolo") || "",
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    deliveryDate: formData.get("deliveryDate"),
    notes: formData.get("notes") || "",
  });
  const docinhoSabores = formData.getAll("docinhoSabor").map((v) => v.toString()).filter(Boolean);

  const doceName =
    parsed.itemType === "bolo"
      ? composeBoloName(parsed)
      : parsed.itemType === "docinho"
        ? composeDocinhoName(docinhoSabores)
        : parsed.doceName;

  // Campos estruturados só existem para bolo/docinho — omitidos (não `undefined`)
  // para "outro", já que o Firestore rejeita valores `undefined` explícitos.
  const structuredFields =
    parsed.itemType === "bolo"
      ? {
          sabores: [parsed.recheioBolo1, parsed.recheioBolo2].filter(Boolean),
          massa: parsed.massaBolo,
          tamanho: parsed.tamanhoBolo,
        }
      : parsed.itemType === "docinho"
        ? { sabores: docinhoSabores }
        : {};

  const customer = parsed.customerId ? await getCustomer(parsed.customerId) : null;

  const data = {
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? "",
    doceName,
    quantity: parsed.quantity,
    unit: parsed.unit,
    deliveryDate: parsed.deliveryDate,
    notes: parsed.notes,
    itemType: parsed.itemType,
    ...structuredFields,
  };

  if (id) {
    await updateCustomOrder(id, data);
  } else {
    await createCustomOrder(data);
  }
  revalidatePath("/admin/encomendas");
  revalidatePath("/admin/clientes");
  redirect("/admin/encomendas?saved=1");
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
