import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { CustomOrder } from "@/lib/types";

const collection = () => adminDb.collection("customOrders");

export async function listCustomOrders(): Promise<CustomOrder[]> {
  const snap = await collection().get();
  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomOrder));
  return orders.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
}

export async function listCustomOrdersByCustomer(customerId: string): Promise<CustomOrder[]> {
  const snap = await collection().where("customerId", "==", customerId).get();
  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomOrder));
  return orders.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
}

export async function createCustomOrder(
  data: Omit<CustomOrder, "id" | "createdAt" | "status">
): Promise<string> {
  const ref = collection().doc();
  await ref.set({ ...data, status: "pendente", createdAt: new Date().toISOString() });
  return ref.id;
}

export async function updateCustomOrder(
  id: string,
  data: Partial<Omit<CustomOrder, "id">>
): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteCustomOrder(id: string): Promise<void> {
  await collection().doc(id).delete();
}
