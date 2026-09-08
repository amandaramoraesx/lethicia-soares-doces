"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createIngredient, updateIngredient, deleteIngredient } from "@/lib/db/ingredients";

const ingredientSchema = z.object({
  name: z.string().min(1, "Informe o nome do insumo."),
  unit: z.enum(["un", "kg", "g", "l", "ml"]),
  costPerUnit: z.coerce.number().min(0),
  stockQty: z.coerce.number().min(0),
  minStockQty: z.coerce.number().min(0),
});

export async function saveIngredientAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = ingredientSchema.parse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    costPerUnit: formData.get("costPerUnit"),
    stockQty: formData.get("stockQty"),
    minStockQty: formData.get("minStockQty"),
  });

  if (id) {
    await updateIngredient(id, parsed);
  } else {
    await createIngredient(parsed);
  }
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
}

export async function deleteIngredientAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteIngredient(id);
  revalidatePath("/admin/estoque");
}
