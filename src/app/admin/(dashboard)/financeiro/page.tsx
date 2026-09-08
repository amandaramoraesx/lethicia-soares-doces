import Link from "next/link";
import { computeProfitReport } from "@/lib/db/orders";
import {
  listFinancialCategories,
  listFinancialEntries,
  listPayables,
  listReceivables,
  getCashFlow,
} from "@/lib/db/financial";
import {
  createFinancialCategoryAction,
  deleteFinancialCategoryAction,
  createFinancialEntryAction,
  deleteFinancialEntryAction,
  createPayableAction,
  markPayablePaidAction,
  deletePayableAction,
} from "@/actions/financial";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function firstDayOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from || firstDayOfMonthISO();
  const to = sp.to || todayISODate();
  const fromISO = new Date(`${from}T00:00:00`).toISOString();
  const toISO = new Date(`${to}T23:59:59`).toISOString();

  const [categories, entries, payables, receivables, cashFlow, profit] = await Promise.all([
    listFinancialCategories(),
    listFinancialEntries(),
    listPayables(),
    listReceivables(),
    getCashFlow(fromISO, toISO),
    computeProfitReport(fromISO, toISO),
  ]);

  const entryCategories = categories;
  const openPayables = payables.filter((p) => p.status === "aberta");
  const openReceivables = receivables.filter((r) => r.status === "aberta");
  const periodEntries = entries.filter((e) => e.date >= fromISO && e.date <= toISO);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Financeiro</h1>

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">De</label>
          <input type="date" name="from" defaultValue={from} className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Até</label>
          <input type="date" name="to" defaultValue={to} className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600">
          Filtrar período
        </button>
      </form>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Entradas no período</p>
          <p className="mt-1 text-xl font-semibold text-green-600">{formatBRL(cashFlow.entradas)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Saídas no período</p>
          <p className="mt-1 text-xl font-semibold text-red-500">{formatBRL(cashFlow.saidas)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Saldo de caixa</p>
          <p className="mt-1 text-xl font-semibold text-stone-800">{formatBRL(cashFlow.saldo)}</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">
          Relatório de lucro ({profit.ordersCount} pedido{profit.ordersCount === 1 ? "" : "s"})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-stone-500">Receita</p>
            <p className="font-semibold text-stone-800">{formatBRL(profit.revenue)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Custo insumos</p>
            <p className="font-semibold text-stone-800">{formatBRL(profit.cogs)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Despesas</p>
            <p className="font-semibold text-stone-800">{formatBRL(profit.expenses)}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Lucro</p>
            <p className={`font-semibold ${profit.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
              {formatBRL(profit.profit)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Categorias financeiras</h2>
          <form action={createFinancialCategoryAction} className="mb-4 flex flex-wrap items-end gap-2">
            <input name="name" placeholder="Nome" required className="w-32 rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
            <select name="type" className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <button type="submit" className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-600">
              Adicionar
            </button>
          </form>
          <ul className="space-y-1 text-sm">
            {entryCategories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between">
                <span>
                  {cat.name} <span className="text-xs text-stone-400">({cat.type})</span>
                </span>
                <form action={deleteFinancialCategoryAction}>
                  <input type="hidden" name="id" value={cat.id} />
                  <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                    excluir
                  </button>
                </form>
              </li>
            ))}
            {entryCategories.length === 0 && <p className="text-xs text-stone-400">Nenhuma categoria ainda.</p>}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Novo lançamento</h2>
          <form action={createFinancialEntryAction} className="space-y-2">
            <div className="flex gap-2">
              <select name="type" className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <select name="categoryId" required className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                {entryCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="description"
              placeholder="Descrição"
              className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                placeholder="Valor"
                required
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                name="date"
                defaultValue={todayISODate()}
                required
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={entryCategories.length === 0}
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-40"
            >
              Lançar
            </button>
          </form>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        <h2 className="border-b border-stone-100 px-5 py-3 text-sm font-semibold text-stone-700">
          Lançamentos do período
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase text-stone-500">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {periodEntries.map((entry) => (
              <tr key={entry.id} className="border-t border-stone-100">
                <td className="px-4 py-2">{formatDate(entry.date)}</td>
                <td className="px-4 py-2">{entry.categoryName}</td>
                <td className="px-4 py-2">{entry.description || "—"}</td>
                <td className={`px-4 py-2 font-medium ${entry.type === "entrada" ? "text-green-600" : "text-red-500"}`}>
                  {entry.type === "entrada" ? "+" : "-"}
                  {formatBRL(entry.amount)}
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteFinancialEntryAction}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                      excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {periodEntries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-400">
                  Nenhum lançamento no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Contas a pagar</h2>
          <form action={createPayableAction} className="mb-4 space-y-2">
            <input
              name="description"
              placeholder="Descrição"
              required
              className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <select name="categoryId" required className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm">
                {entryCategories
                  .filter((c) => c.type === "saida")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                placeholder="Valor"
                required
                className="w-28 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <input type="date" name="dueDate" required className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
            <button
              type="submit"
              disabled={entryCategories.filter((c) => c.type === "saida").length === 0}
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-40"
            >
              Adicionar conta
            </button>
          </form>

          <ul className="space-y-2 text-sm">
            {openPayables.map((payable) => (
              <li key={payable.id} className="flex items-center justify-between border-t border-stone-100 pt-2">
                <div>
                  <p className="text-stone-700">{payable.description}</p>
                  <p className="text-xs text-stone-400">
                    Vence {formatDate(payable.dueDate)} · {formatBRL(payable.amount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={markPayablePaidAction}>
                    <input type="hidden" name="id" value={payable.id} />
                    <button type="submit" className="text-xs font-medium text-green-600 hover:text-green-700">
                      marcar paga
                    </button>
                  </form>
                  <form action={deletePayableAction}>
                    <input type="hidden" name="id" value={payable.id} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">
                      excluir
                    </button>
                  </form>
                </div>
              </li>
            ))}
            {openPayables.length === 0 && <p className="text-xs text-stone-400">Nenhuma conta em aberto.</p>}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Contas a receber (fiado)</h2>
          <ul className="space-y-2 text-sm">
            {openReceivables.map((receivable) => (
              <li key={receivable.id} className="flex items-center justify-between border-t border-stone-100 pt-2">
                <div>
                  <Link href={`/admin/clientes/${receivable.customerId}`} className="text-pink-700 hover:underline">
                    {receivable.customerName}
                  </Link>
                  <p className="text-xs text-stone-400">Desde {formatDate(receivable.createdAt)}</p>
                </div>
                <span className="font-medium text-amber-600">
                  {formatBRL(receivable.originalAmount - receivable.paidAmount)}
                </span>
              </li>
            ))}
            {openReceivables.length === 0 && <p className="text-xs text-stone-400">Nenhuma conta em aberto.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
