import { notFound } from "next/navigation";
import { getCustomer, listOrdersByCustomer, listFiadoEntries } from "@/lib/db/customers";
import { listCustomOrdersByCustomer } from "@/lib/db/custom-orders";
import { registerFiadoPaymentAction } from "@/actions/customers";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import { waLink, SITE_URL } from "@/lib/whatsapp";

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

  const [orders, fiadoEntries, customOrders] = await Promise.all([
    listOrdersByCustomer(id),
    listFiadoEntries(id),
    listCustomOrdersByCustomer(id),
  ]);

  const validOrders = orders.filter((o) => o.status !== "cancelado");
  const totalGasto = validOrders.reduce((sum, o) => sum + o.total, 0);
  const ticketMedio = validOrders.length > 0 ? totalGasto / validOrders.length : 0;

  const topDoces = (() => {
    const map = new Map<string, { name: string; quantity: number }>();
    for (const order of orders) {
      if (order.status === "cancelado") continue;
      for (const item of order.items) {
        const current = map.get(item.productId) ?? { name: item.name, quantity: 0 };
        current.quantity += item.quantity;
        map.set(item.productId, current);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  })();

  const cardapioLink = waLink(
    customer.phone,
    `Oi ${customer.name}! Dá uma olhada no nosso cardápio 🍰\n${SITE_URL}`
  );
  const conversarLink = waLink(customer.phone, `Oi ${customer.name}! `);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-800">{customer.name}</h1>
      <p className="mb-4 text-sm text-stone-500">
        {customer.phone} {customer.address && `· ${customer.address}`}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {cardapioLink && (
          <a
            href={cardapioLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-3 py-2 text-xs font-medium text-white hover:opacity-90"
          >
            📋 Enviar cardápio no WhatsApp
          </a>
        )}
        {conversarLink && (
          <a
            href={conversarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200"
          >
            💬 Falar / confirmar pedido no WhatsApp
          </a>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-800">📝 Observação interna</h2>
            <a
              href={`/admin/clientes?edit=${customer.id}`}
              className="text-xs font-medium text-amber-700 hover:underline"
            >
              Editar
            </a>
          </div>
          {customer.internalNote ? (
            <p className="whitespace-pre-wrap text-sm text-amber-900">{customer.internalNote}</p>
          ) : (
            <p className="text-sm text-amber-700/60">Nenhuma observação registrada.</p>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">💰 Financeiro</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-stone-400">Total gasto</p>
              <p className="text-lg font-semibold text-stone-800">{formatBRL(totalGasto)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Pedidos realizados</p>
              <p className="text-lg font-semibold text-stone-800">{validOrders.length}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Ticket médio</p>
              <p className="text-lg font-semibold text-stone-800">{formatBRL(ticketMedio)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-2 text-sm font-semibold text-stone-700">Valores em aberto</h2>
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

        {customOrders.length > 0 && (
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <h2 className="mb-3 text-sm font-semibold text-stone-700">🎂 Encomendas</h2>
            <ul className="space-y-2">
              {customOrders.map((order) => (
                <li key={order.id} className="border-b border-stone-100 pb-2 text-sm last:border-0">
                  <div className="flex justify-between">
                    <span className="text-stone-700">
                      {order.doceName} — {order.quantity}
                      {order.unit}
                    </span>
                    <span className="font-medium text-stone-600">
                      {new Date(`${order.deliveryDate}T00:00:00`).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    {order.status === "pendente" ? "Pendente" : order.status === "entregue" ? "Entregue" : "Cancelada"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">🏆 Doces mais pedidos</h2>
          {topDoces.length === 0 ? (
            <p className="text-sm text-stone-400">Sem pedidos suficientes ainda.</p>
          ) : (
            <ul className="space-y-2">
              {topDoces.map((doce, i) => (
                <li key={doce.name} className="flex items-center justify-between text-sm">
                  <span className="text-stone-700">
                    {["🥇", "🥈", "🥉"][i]} {doce.name}
                  </span>
                  <span className="font-medium text-stone-500">{doce.quantity}x</span>
                </li>
              ))}
            </ul>
          )}
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
