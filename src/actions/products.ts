"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createProduct, updateProduct, deleteProduct, setProductActive } from "@/lib/db/products";
import { uploadProductImage } from "@/lib/upload-image";

const productSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto."),
  description: z.string().default(""),
  price: z.coerce.number().min(0),
  imageUrls: z.array(z.string()).default([]),
  stockQty: z.coerce.number().min(0).default(0),
});

function parseExistingImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export async function saveProductAction(formData: FormData) {
  const id = formData.get("id")?.toString();

  const keptImageUrls = parseExistingImageUrls(formData.get("existingImageUrls")?.toString() ?? null);
  const newFiles = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(newFiles.map((file) => uploadProductImage(file)));
  const imageUrls = [...keptImageUrls, ...uploadedUrls];

  const parsed = productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    imageUrls,
    stockQty: formData.get("stockQty") || 0,
  });

  const base = {
    ...parsed,
    featured: false,
    stockControl: true,
    recipe: [],
  };

  if (id) {
    // Não mexe em "active" aqui — isso é controlado pelo botão Esgotar/Disponibilizar
    // na listagem (ou automaticamente quando o estoque zera com uma venda).
    await updateProduct(id, base);
  } else {
    await createProduct({ ...base, active: parsed.stockQty > 0 });
  }
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/estoque");
  revalidatePath("/");
  redirect("/admin/produtos?saved=1");
}

export async function toggleProductActiveAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const active = formData.get("active") === "true";
  if (!id) return;
  await setProductActive(id, active);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
