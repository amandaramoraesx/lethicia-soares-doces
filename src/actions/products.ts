"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProduct, updateProduct, deleteProduct } from "@/lib/db/products";

const recipeItemSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive(),
});

const productSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto."),
  description: z.string().default(""),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  imageUrl: z.string().default(""),
  active: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
  stockControl: z.coerce.boolean().default(false),
  stockQty: z.coerce.number().default(0),
  recipe: z.array(recipeItemSchema).default([]),
});

function parseRecipe(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveProductAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") || "",
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    stockControl: formData.get("stockControl") === "on",
    stockQty: formData.get("stockQty") || 0,
    recipe: parseRecipe(formData.get("recipe")?.toString() ?? null),
  });

  if (id) {
    await updateProduct(id, parsed);
  } else {
    await createProduct(parsed);
  }
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/estoque");
  revalidatePath("/");
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
