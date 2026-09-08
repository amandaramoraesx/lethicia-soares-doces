import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { Ingredient } from "@/lib/types";

const collection = () => adminDb.collection("ingredients");

export async function listIngredients(): Promise<Ingredient[]> {
  const snap = await collection().orderBy("name", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Ingredient));
}

export async function getIngredientsByIds(ids: string[]): Promise<Ingredient[]> {
  if (ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids));
  const docs = await Promise.all(uniqueIds.map((id) => collection().doc(id).get()));
  return docs
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, ...doc.data() } as Ingredient));
}

export async function createIngredient(data: Omit<Ingredient, "id">): Promise<string> {
  const ref = collection().doc();
  await ref.set(data);
  return ref.id;
}

export async function updateIngredient(id: string, data: Partial<Omit<Ingredient, "id">>): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteIngredient(id: string): Promise<void> {
  await collection().doc(id).delete();
}

export async function decrementIngredientStock(id: string, quantity: number): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const ref = collection().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const current = (snap.data() as Ingredient).stockQty ?? 0;
    tx.update(ref, { stockQty: Math.max(0, current - quantity) });
  });
}
