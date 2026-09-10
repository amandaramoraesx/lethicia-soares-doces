import Link from "next/link";
import { listOrders } from "@/lib/db/orders";
import { getStoreSettings } from "@/lib/db/settings";
import { updateOrderStatusAction, acceptOrderAction, rejectOrderAction } from "@/actions/orders";
import Collapsible from "@/components/admin/collapsible";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const COLUMNS: OrderStatus[] = ["recebido", "preparo", "saiu_entrega", "entregue"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  recebido: "preparo",
  preparo: "saiu_entrega",
  saiu_entrega: "entregue",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function PendingOrderCard({ order, suggestedFee }: { order: Order; suggestedFee: number }) {
  return (
    <div className="mb-3 rounded-xl bg-white p-4 shadow-sm ring-2 ring-amber-300">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-800">{order.customerName || "Cliente"}</p>
        <span className="text-xs text-stone-400">{formatTime(order.createdAt)}</span>
      </div>
      <p className="mb-1 text-xs text-stone-500">
        {order.deliveryType === "entrega" ? `Entrega — ${order.address}` : "Retirada"} ·{" "}
        {PAYMENT_METHOD_LABELS[order.paymentMethod]}
      </p>
      {order.customerPhone && <p className="mb-1 text-xs text-stone-500">📱 {order.customerPhone}</p>}
      <ul className="mb-2 space-y-0.5 text-xs text-stone-600">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>
      <p className="mb-3 text-sm font-semibold text-stone-800">
        Subtotal: {formatBRL(order.subtotal)}
      </p>
      {order.notes && <p className="mb-3 text-xs italic text-stone-500">&quot;{order.notes}&quot;</p>}

      <form action={acceptOrderAction} className="mb-2 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={order.id} />
        {order.deliveryType === "entrega" && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-500">Taxa R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="deliveryFee"
              defaultValue={suggestedFee}
              className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-xs"
            />
          </div>
        )}
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
        >
          ✓ Aceitar pedido
        </button>
      </form>
      <form action={rejectOrderAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={order.id} />
        <input
          type="text"
          name="reason"
          placeholder="Motivo (opcional)"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 px-2 py-1 text-xs"
        />
        <button
          type="submit"
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          ✕ Recusar
        </button>
      </form>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const next = NEXT_STATUS[order.status];
  const itemsSummary = order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ");
  return (
    <div className="border-b border-stone-100 py-2.5 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium text-stone-800">
          {order.customerName || "Cliente"}
        </p>
        <span className="shrink-0 text-xs font-semibold text-stone-700">{formatBRL(order.total)}</span>
      </div>
      <p className="truncate text-xs text-stone-500">{itemsSummary}</p>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-stone-400">
          {formatTime(order.createdAt)} · {order.deliveryType === "entrega" ? "Entrega" : "Retirada"} ·{" "}
          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          {order.source === "manual" && " · manual"}
        </span>
        <div className="flex shrink-0 gap-2">
          {next && (
            <form action={updateOrderStatusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={next} />
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-pink-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-pink-600"
              >
                → {ORDER_STATUS_LABELS[next]}
              </button>
            </form>
          )}
          {order.status !== "cancelado" && order.status !== "entregue" && (
            <form action={updateOrderStatusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value="cancelado" />
              <button type="submit" className="text-[11px] text-red-500 hover:text-red-700">
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
      {order.notes && <p className="mt-0.5 text-[11px] italic text-stone-400">&quot;{order.notes}&quot;</p>}
    </div>
  );
}

export default async function PedidosPage() {
  const [orders, settings] = await Promise.all([listOrders(), getStoreSettings()]);
  const pendingOrders = orders.filter((o) => o.status === "aguardando");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-800">Pedidos</h1>
        <Link
          href="/admin/pedidos/novo"
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
        >
          + Novo pedido manual
        </Link>
      </div>

      {pendingOrders.length > 0 && (
        <div className="mb-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <h2 className="mb-3 text-sm font-semibold text-amber-800">
            🔔 Aguardando confirmação ({pendingOrders.length})
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} suggestedFee={settings.deliveryFee} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {COLUMNS.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <Collapsible
              key={status}
              titulo={ORDER_STATUS_LABELS[status]}
              resumo={`${columnOrders.length} pedido${columnOrders.length === 1 ? "" : "s"}`}
              defaultAberto={status === "recebido" || status === "preparo" || status === "saiu_entrega"}
            >
              {columnOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {columnOrders.length === 0 && (
                <p className="py-2 text-center text-xs text-stone-400">Nenhum pedido.</p>
              )}
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
