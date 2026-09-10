"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createOrderCatalogItem,
  updateOrderCatalogItem,
  deleteOrderCatalogItem,
} from "@/lib/db/order-catalog";
import { uploadOrderCatalogImage } from "@/lib/upload-image";

const catalogItemSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  description: z.string().default(""),
  category: z.enum(["bolo", "docinho"]),
  imageUrls: z.array(z.string()).default([]),
  active: z.boolean().default(true),
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

export async function saveOrderCatalogItemAction(formData: FormData) {
  const id = formData.get("id")?.toString();

  const keptImageUrls = parseExistingImageUrls(formData.get("existingImageUrls")?.toString() ?? null);
  const newFiles = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(newFiles.map((file) => uploadOrderCatalogImage(file)));
  const imageUrls = [...keptImageUrls, ...uploadedUrls];

  const parsed = catalogItemSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    category: formData.get("category"),
    imageUrls,
    active: formData.get("active") === "on",
  });

  if (id) {
    await updateOrderCatalogItem(id, parsed);
  } else {
    await createOrderCatalogItem(parsed);
  }
  revalidatePath("/admin/catalogo-encomendas");
  revalidatePath("/");
  redirect("/admin/catalogo-encomendas?saved=1");
}

export async function deleteOrderCatalogItemAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteOrderCatalogItem(id);
  revalidatePath("/admin/catalogo-encomendas");
  revalidatePath("/");
}
