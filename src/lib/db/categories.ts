import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { Category } from "@/lib/types";

const collection = () => adminDb.collection("categories");

export async function listCategories(): Promise<Category[]> {
  const snap = await collection().orderBy("order", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
}

export async function createCategory(data: Omit<Category, "id">): Promise<string> {
  const ref = collection().doc();
  await ref.set(data);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id">>): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await collection().doc(id).delete();
}
