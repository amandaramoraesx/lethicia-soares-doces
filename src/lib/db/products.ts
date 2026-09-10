import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeProduct, type Product } from "@/lib/types";

const collection = () => adminDb.collection("products");

export async function listProducts(): Promise<Product[]> {
  const snap = await collection().orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => normalizeProduct(doc.id, doc.data()));
}

// "active" nunca esconde o produto do cardápio público — ele só controla o
// selo "Indisponível hoje" (igual ao estoque zerado). Um produto só some de
// verdade se for excluído. Mantido como alias por clareza no código que
// busca produtos para o cliente ver.
export async function listAvailableProducts(): Promise<Product[]> {
  return listProducts();
}

export async function getProduct(id: string): Promise<Product | null> {
  const doc = await collection().doc(id).get();
  if (!doc.exists) return null;
  return normalizeProduct(doc.id, doc.data()!);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const uniqueIds = Array.from(new Set(ids));
  const docs = await Promise.all(uniqueIds.map((id) => collection().doc(id).get()));
  return docs
    .filter((doc) => doc.exists)
    .map((doc) => normalizeProduct(doc.id, doc.data()!));
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

export async function setProductActive(id: string, active: boolean): Promise<void> {
  await collection().doc(id).update({ active });
}

export async function decrementProductStock(id: string, quantity: number): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const ref = collection().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const current = (snap.data() as Product).stockQty ?? 0;
    const newQty = Math.max(0, current - quantity);
    // Não mexe em "active" ao zerar o estoque — o produto continua visível
    // no cardápio como "Indisponível hoje" (com opção de encomendar).
    tx.update(ref, { stockQty: newQty });
  });
}
