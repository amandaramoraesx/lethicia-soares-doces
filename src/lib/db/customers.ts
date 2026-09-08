import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { Customer, FiadoEntry, Order } from "@/lib/types";
import { listOpenReceivablesByCustomer, applyPaymentToReceivable, createFinancialEntry } from "@/lib/db/financial";

const collection = () => adminDb.collection("customers");
const fiadoCollection = () => adminDb.collection("fiadoEntries");

export async function listCustomers(): Promise<Customer[]> {
  const snap = await collection().orderBy("name", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const doc = await collection().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Customer;
}

export async function createCustomer(
  data: Omit<Customer, "id" | "createdAt" | "fiadoBalance">
): Promise<string> {
  const ref = collection().doc();
  await ref.set({ ...data, createdAt: new Date().toISOString(), fiadoBalance: 0 });
  return ref.id;
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, "id" | "createdAt" | "fiadoBalance">>
): Promise<void> {
  await collection().doc(id).update(data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await collection().doc(id).delete();
}

export async function findOrCreateCustomerByPhone(
  name: string,
  phone: string,
  address: string
): Promise<string> {
  const existing = await collection().where("phone", "==", phone).limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.update({ name, address: address || doc.data().address || "" });
    return doc.id;
  }
  return createCustomer({ name, phone, address });
}

export async function listOrdersByCustomer(customerId: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("customerId", "==", customerId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
}

export async function listFiadoEntries(customerId: string): Promise<FiadoEntry[]> {
  const snap = await fiadoCollection()
    .where("customerId", "==", customerId)
    .orderBy("date", "desc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FiadoEntry));
}

export async function adjustCustomerFiadoBalance(customerId: string, delta: number): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const ref = collection().doc(customerId);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const current = (snap.data() as Customer).fiadoBalance ?? 0;
    tx.update(ref, { fiadoBalance: current + delta });
  });
}

export async function createFiadoEntry(data: Omit<FiadoEntry, "id">): Promise<string> {
  const ref = fiadoCollection().doc();
  await ref.set(data);
  return ref.id;
}

export async function registerFiadoPayment(
  customerId: string,
  customerName: string,
  amount: number,
  note: string
): Promise<void> {
  let remaining = amount;
  const openReceivables = await listOpenReceivablesByCustomer(customerId);

  for (const receivable of openReceivables) {
    if (remaining <= 0) break;
    const due = receivable.originalAmount - receivable.paidAmount;
    const payment = Math.min(due, remaining);
    if (payment <= 0) continue;
    await applyPaymentToReceivable(receivable.id, payment);
    remaining -= payment;
  }

  await createFiadoEntry({
    customerId,
    type: "pagamento",
    amount,
    date: new Date().toISOString(),
    note,
    orderId: null,
    receivableId: null,
  });

  await adjustCustomerFiadoBalance(customerId, -amount);

  await createFinancialEntry({
    type: "entrada",
    categoryId: "recebimento-fiado",
    categoryName: "Recebimento fiado",
    description: `Pagamento fiado — ${customerName}`,
    amount,
    date: new Date().toISOString(),
    orderId: null,
    customerId,
  });
}
