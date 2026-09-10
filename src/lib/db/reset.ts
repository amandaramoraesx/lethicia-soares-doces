import "server-only";
import { adminDb } from "@/lib/firebase-admin";

const BATCH_LIMIT = 450;

async function deleteAllDocs(collectionName: string): Promise<number> {
  const snap = await adminDb.collection(collectionName).get();
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
    const chunk = snap.docs.slice(i, i + BATCH_LIMIT);
    const batch = adminDb.batch();
    for (const doc of chunk) batch.delete(doc.ref);
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

async function resetCustomerFiadoBalances(): Promise<number> {
  const snap = await adminDb.collection("customers").get();
  let updated = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
    const chunk = snap.docs.slice(i, i + BATCH_LIMIT);
    const batch = adminDb.batch();
    for (const doc of chunk) batch.update(doc.ref, { fiadoBalance: 0 });
    await batch.commit();
    updated += chunk.length;
  }
  return updated;
}

// Apaga pedidos, encomendas e todo o financeiro (lançamentos, contas a pagar/
// receber, fiado) — pensado pra limpar dados de teste antes de a loja
// começar a usar de verdade. Mantém intactos: doces, catálogo de
// encomendas, estoque, clientes cadastrados (só zera o saldo de fiado deles,
// já que as contas/lançamentos que o compunham deixam de existir) e as
// configurações da loja.
export async function resetTestData(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  results.pedidos = await deleteAllDocs("orders");
  results.encomendas = await deleteAllDocs("customOrders");
  results.lancamentosFinanceiros = await deleteAllDocs("financialEntries");
  results.contasAReceber = await deleteAllDocs("accountsReceivable");
  results.contasAPagar = await deleteAllDocs("accountsPayable");
  results.fiado = await deleteAllDocs("fiadoEntries");
  results.clientesComSaldoZerado = await resetCustomerFiadoBalances();
  return results;
}
