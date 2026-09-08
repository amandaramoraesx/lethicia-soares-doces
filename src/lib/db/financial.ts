import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type {
  AccountPayable,
  AccountReceivable,
  FinancialCategory,
  FinancialEntry,
} from "@/lib/types";

const categoriesCollection = () => adminDb.collection("financialCategories");
const entriesCollection = () => adminDb.collection("financialEntries");
const receivablesCollection = () => adminDb.collection("accountsReceivable");
const payablesCollection = () => adminDb.collection("accountsPayable");

export async function listFinancialCategories(): Promise<FinancialCategory[]> {
  const snap = await categoriesCollection().orderBy("name", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FinancialCategory));
}

export async function createFinancialCategory(data: Omit<FinancialCategory, "id">): Promise<string> {
  const ref = categoriesCollection().doc();
  await ref.set(data);
  return ref.id;
}

export async function deleteFinancialCategory(id: string): Promise<void> {
  await categoriesCollection().doc(id).delete();
}

export async function listFinancialEntries(): Promise<FinancialEntry[]> {
  const snap = await entriesCollection().orderBy("date", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FinancialEntry));
}

export async function createFinancialEntry(data: Omit<FinancialEntry, "id">): Promise<string> {
  const ref = entriesCollection().doc();
  await ref.set(data);
  return ref.id;
}

export async function deleteFinancialEntry(id: string): Promise<void> {
  await entriesCollection().doc(id).delete();
}

export async function listReceivables(): Promise<AccountReceivable[]> {
  const snap = await receivablesCollection().orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccountReceivable));
}

export async function listOpenReceivablesByCustomer(customerId: string): Promise<AccountReceivable[]> {
  const snap = await receivablesCollection()
    .where("customerId", "==", customerId)
    .where("status", "==", "aberta")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccountReceivable));
}

export async function createReceivable(data: Omit<AccountReceivable, "id">): Promise<string> {
  const ref = receivablesCollection().doc();
  await ref.set(data);
  return ref.id;
}

export async function applyPaymentToReceivable(id: string, amount: number): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const ref = receivablesCollection().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const receivable = snap.data() as AccountReceivable;
    const newPaid = receivable.paidAmount + amount;
    tx.update(ref, {
      paidAmount: newPaid,
      status: newPaid >= receivable.originalAmount ? "quitada" : "aberta",
    });
  });
}

export async function listPayables(): Promise<AccountPayable[]> {
  const snap = await payablesCollection().orderBy("dueDate", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccountPayable));
}

export async function createPayable(
  data: Omit<AccountPayable, "id" | "createdAt" | "status" | "paidAt">
): Promise<string> {
  const ref = payablesCollection().doc();
  await ref.set({
    ...data,
    status: "aberta",
    paidAt: null,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function markPayablePaid(id: string): Promise<AccountPayable | null> {
  const ref = payablesCollection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const payable = { id: snap.id, ...snap.data() } as AccountPayable;
  if (payable.status === "paga") return payable;

  const paidAt = new Date().toISOString();
  await ref.update({ status: "paga", paidAt });
  await createFinancialEntry({
    type: "saida",
    categoryId: payable.categoryId,
    categoryName: payable.categoryName,
    description: payable.description,
    amount: payable.amount,
    date: paidAt,
    orderId: null,
    customerId: null,
  });
  return payable;
}

export async function deletePayable(id: string): Promise<void> {
  await payablesCollection().doc(id).delete();
}

export interface ProfitReportResult {
  revenue: number;
  cogs: number;
  expenses: number;
  profit: number;
  ordersCount: number;
}

export async function getCashFlow(
  fromISO: string,
  toISO: string
): Promise<{ entradas: number; saidas: number; saldo: number; entries: FinancialEntry[] }> {
  const all = await listFinancialEntries();
  const entries = all.filter((entry) => entry.date >= fromISO && entry.date <= toISO);
  const entradas = entries
    .filter((e) => e.type === "entrada")
    .reduce((sum, e) => sum + e.amount, 0);
  const saidas = entries.filter((e) => e.type === "saida").reduce((sum, e) => sum + e.amount, 0);
  return { entradas, saidas, saldo: entradas - saidas, entries };
}
