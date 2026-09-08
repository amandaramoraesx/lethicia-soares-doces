import { notFound } from "next/navigation";
import { getCustomer, listOrdersByCustomer, listFiadoEntries } from "@/lib/db/customers";
import { registerFiadoPaymentAction } from "@/actions/customers";
import { ORDER_STATUS_LABELS } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const [orders, fiadoEntries] = await Promise.all([
    listOrdersByCustomer(id),
    listFiadoEntries(id),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-800">{customer.name}</h1>
      <p className="mb-6 text-sm text-stone-500">
        {customer.phone} {customer.address && `· ${customer.address}`}
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Saldo devedor (fiado)</h2>
          <p className="mb-4 text-3xl font-semibold text-amber-600">{formatBRL(customer.fiadoBalance)}</p>

          {customer.fiadoBalance > 0 && (
            <form action={registerFiadoPaymentAction} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="customerId" value={customer.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Valor recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={customer.fiadoBalance}
                  name="amount"
                  required
                  className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Observação</label>
                <input name="note" className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                Registrar pagamento
              </button>
            </form>
          )}

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase text-stone-500">Histórico de fiado</h3>
            {fiadoEntries.length === 0 ? (
              <p className="text-sm text-stone-400">Sem movimentações.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {fiadoEntries.map((entry) => (
                  <li key={entry.id} className="flex justify-between">
                    <span className="text-stone-600">
                      {entry.type === "venda" ? "Venda fiada" : "Pagamento"} — {formatDate(entry.date)}
                    </span>
                    <span
                      className={entry.type === "venda" ? "font-medium text-amber-600" : "font-medium text-green-600"}
                    >
                      {entry.type === "venda" ? "+" : "-"}
                      {formatBRL(entry.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Histórico de pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhum pedido registrado.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((order) => (
                <li key={order.id} className="border-b border-stone-100 pb-2 text-sm last:border-0">
                  <div className="flex justify-between">
                    <span className="text-stone-700">{formatDate(order.createdAt)}</span>
                    <span className="font-medium text-stone-600">{formatBRL(order.total)}</span>
                  </div>
                  <p className="text-xs text-stone-400">{ORDER_STATUS_LABELS[order.status]}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
