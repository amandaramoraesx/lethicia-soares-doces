import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeOrderCatalogItem, type OrderCatalogItem } from "@/lib/types";

const collection = () => adminDb.collection("orderCatalogItems");

export async function listOrderCatalogItems(): Promise<OrderCatalogItem[]> {
  const snap = await collection().orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => normalizeOrderCatalogItem(doc.id, doc.data()));
}

export async function listActiveOrderCatalogItems(): Promise<OrderCatalogItem[]> {
  const items = await listOrderCatalogItems();
  return items.filter((i) => i.active);
}

export async function getOrderCatalogItem(id: string): Promise<OrderCatalogItem | null> {
  const doc = await collection().doc(id).get();
  if (!doc.exists) return null;
  return normalizeOrderCatalogItem(doc.id, doc.data()!);
}

export async function createOrderCatalogItem(data: Omit<OrderCatalogItem, "id" | "createdAt">): Promise<string> {
  const ref = collection().doc();
  await ref.set({ ...data, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function updateOrderCatalogItem(id: string, data: Partial<Omit<OrderCatalogItem, "id">>): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteOrderCatalogItem(id: string): Promise<void> {
  await collection().doc(id).delete();
}
