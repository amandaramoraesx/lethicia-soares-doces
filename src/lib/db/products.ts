import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";

const collection = () => adminDb.collection("products");

export async function listProducts(): Promise<Product[]> {
  const snap = await collection().orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export async function listAvailableProducts(): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((p) => p.active);
}

export async function getProduct(id: string): Promise<Product | null> {
  const doc = await collection().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Product;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids));
  const docs = await Promise.all(uniqueIds.map((id) => collection().doc(id).get()));
  return docs
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, ...doc.data() } as Product));
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">): Promise<string> {
  const ref = collection().doc();
  await ref.set({ ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id">>): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await collection().doc(id).delete();
}

export async function decrementProductStock(id: string, quantity: number): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const ref = collection().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const current = (snap.data() as Product).stockQty ?? 0;
    tx.update(ref, { stockQty: Math.max(0, current - quantity) });
  });
}
