import { listFinancialEntries, listPayables, listReceivables } from "@/lib/db/financial";
import FinanceiroClient from "@/components/admin/financeiro-client";

export default async function FinanceiroPage() {
  const [entries, payables, receivables] = await Promise.all([
    listFinancialEntries(),
    listPayables(),
    listReceivables(),
  ]);

  return <FinanceiroClient entries={entries} payables={payables} receivables={receivables} />;
}
