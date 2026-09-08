"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCategory, updateCategory, deleteCategory } from "@/lib/db/categories";

const categorySchema = z.object({
  name: z.string().min(1, "Informe o nome da categoria."),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export async function saveCategoryAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    order: formData.get("order") || 0,
    active: formData.get("active") === "on",
  });

  if (id) {
    await updateCategory(id, parsed);
  } else {
    await createCategory(parsed);
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
