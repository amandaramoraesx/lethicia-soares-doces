"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createFinancialCategory,
  deleteFinancialCategory,
  createFinancialEntry,
  deleteFinancialEntry,
  createPayable,
  markPayablePaid,
  deletePayable,
  listFinancialCategories,
} from "@/lib/db/financial";

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["entrada", "saida"]),
});

export async function createFinancialCategoryAction(formData: FormData) {
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
  });
  await createFinancialCategory(parsed);
  revalidatePath("/admin/financeiro");
}

export async function deleteFinancialCategoryAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteFinancialCategory(id);
  revalidatePath("/admin/financeiro");
}

const entrySchema = z.object({
  type: z.enum(["entrada", "saida"]),
  categoryId: z.string().min(1),
  description: z.string().default(""),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
});

export async function createFinancialEntryAction(formData: FormData) {
  const parsed = entrySchema.parse({
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description") || "",
    amount: formData.get("amount"),
    date: formData.get("date"),
  });
  const categories = await listFinancialCategories();
  const category = categories.find((c) => c.id === parsed.categoryId);

  await createFinancialEntry({
    ...parsed,
    categoryName: category?.name ?? "Outros",
    date: new Date(parsed.date).toISOString(),
    orderId: null,
    customerId: null,
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
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string().min(1),
});

export async function createPayableAction(formData: FormData) {
  const parsed = payableSchema.parse({
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });
  const categories = await listFinancialCategories();
  const category = categories.find((c) => c.id === parsed.categoryId);

  await createPayable({
    ...parsed,
    categoryName: category?.name ?? "Outros",
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
