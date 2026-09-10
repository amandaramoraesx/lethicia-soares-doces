"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createFinancialEntry,
  deleteFinancialEntry,
  createPayable,
  markPayablePaid,
  deletePayable,
} from "@/lib/db/financial";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const entrySchema = z.object({
  type: z.enum(["entrada", "saida"]),
  category: z.string().min(1),
  description: z.string().default(""),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  paymentMethod: z
    .enum([
      "dinheiro",
      "pix",
      "cartao",
      "cartao_debito",
      "cartao_credito",
      "link_cartao",
      "informar_depois",
      "fiado",
    ])
    .nullable()
    .default(null),
});

export async function createFinancialEntryAction(formData: FormData) {
  const paymentMethodRaw = formData.get("paymentMethod")?.toString();
  const parsed = entrySchema.parse({
    type: formData.get("type"),
    category: formData.get("category"),
    description: formData.get("description") || "",
    amount: formData.get("amount"),
    date: formData.get("date"),
    paymentMethod: paymentMethodRaw || null,
  });

  await createFinancialEntry({
    type: parsed.type,
    categoryId: slugify(parsed.category),
    categoryName: parsed.category,
    description: parsed.description,
    amount: parsed.amount,
    date: new Date(parsed.date).toISOString(),
    orderId: null,
    customerId: null,
    paymentMethod: parsed.type === "entrada" ? parsed.paymentMethod : null,
  });
  revalidatePath("/admin/financeiro");
}

export async function deleteFinancialEntryAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteFinancialEntry(id);
  revalidatePath("/admin/financeiro");
}

const payableSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
});

export async function createPayableAction(formData: FormData) {
  const parsed = payableSchema.parse({
    description: formData.get("description"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });

  await createPayable({
    description: parsed.description,
    categoryId: slugify(parsed.category),
    categoryName: parsed.category,
    amount: parsed.amount,
    dueDate: new Date(parsed.dueDate).toISOString(),
  });
  revalidatePath("/admin/financeiro");
}

export async function markPayablePaidAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await markPayablePaid(id);
  revalidatePath("/admin/financeiro");
}

export async function deletePayableAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deletePayable(id);
  revalidatePath("/admin/financeiro");
}
