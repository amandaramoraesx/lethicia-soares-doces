import Link from "next/link";
import { listOrders } from "@/lib/db/orders";
import { getStoreSettings } from "@/lib/db/settings";
import { updateOrderStatusAction, rejectOrderAction, deleteOrderAction } from "@/actions/orders";
import Collapsible from "@/components/admin/collapsible";
import AcceptOrderForm from "@/components/admin/accept-order-form";
import { waLink, buildOrderConfirmationMessage } from "@/lib/whatsapp";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  getOrderStatusLabel,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const COLUMNS: OrderStatus[] = ["recebido", "preparo", "saiu_entrega", "entregue"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  recebido: "preparo",
  preparo: "saiu_entrega",
  saiu_entrega: "entregue",
};
// A coluna do kanban agrupa pedidos de entrega e retirada juntos, então o
// título cobre os dois termos — o texto por pedido já vem certo (ver
// getOrderStatusLabel).
const COLUMN_LABELS: Partial<Record<OrderStatus, string>> = {
  saiu_entrega: "Saiu para entrega / Pronto p/ retirada",
  entregue: "Entregue / Retirado",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function PendingOrderCard({
  order,
  suggestedFee,
  storeAddress,
}: {
  order: Order;
  suggestedFee: number;
  storeAddress: string;
}) {
  return (
    <div className="mb-3 rounded-xl bg-white p-4 shadow-sm ring-2 ring-amber-300">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-stone-800">{order.customerName || "Cliente"}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-stone-400">{formatTime(order.createdAt)}</span>
          <form action={deleteOrderAction}>
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              aria-label="Excluir pedido"
              title="Excluir"
              className="flex h-6 w-6 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
            >
              🗑️
            </button>
          </form>
        </div>
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

      <AcceptOrderForm order={order} suggestedFee={suggestedFee} storeAddress={storeAddress} />
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

function OrderCard({ order, storeAddress }: { order: Order; storeAddress: string }) {
  const next = NEXT_STATUS[order.status];
  const itemsSummary = order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ");
  const whatsappLink = order.customerPhone
    ? waLink(order.customerPhone, buildOrderConfirmationMessage(order, order.total, storeAddress))
    : null;
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
        <div className="flex shrink-0 items-center gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviar confirmação no WhatsApp"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-xs text-white hover:opacity-90"
            >
              💬
            </a>
          )}
          {next && (
            <form action={updateOrderStatusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={next} />
              <button
                type="submit"
                className="whitespace-nowrap rounded-lg bg-pink-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-pink-600"
              >
                → {getOrderStatusLabel(next, order.deliveryType)}
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
          <form action={deleteOrderAction} className="ml-1">
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              aria-label="Excluir pedido"
              title="Excluir"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"
            >
              🗑️
            </button>
          </form>
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
              <PendingOrderCard
                key={order.id}
                order={order}
                suggestedFee={settings.deliveryFee}
                storeAddress={settings.address}
              />
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
              titulo={COLUMN_LABELS[status] ?? ORDER_STATUS_LABELS[status]}
              resumo={`${columnOrders.length} pedido${columnOrders.length === 1 ? "" : "s"}`}
              defaultAberto={status === "recebido" || status === "preparo" || status === "saiu_entrega"}
            >
              {columnOrders.map((order) => (
                <OrderCard key={order.id} order={order} storeAddress={settings.address} />
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
