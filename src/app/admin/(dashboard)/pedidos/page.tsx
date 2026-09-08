import Link from "next/link";
import { listOrders } from "@/lib/db/orders";
import { updateOrderStatusAction } from "@/actions/orders";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/types";

const COLUMNS: OrderStatus[] = ["recebido", "preparo", "pronto", "entregue"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  recebido: "preparo",
  preparo: "pronto",
  pronto: "entregue",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function OrderCard({ order }: { order: Order }) {
  const next = NEXT_STATUS[order.status];
  return (
    <div className="mb-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-stone-200">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-800">{order.customerName || "Cliente"}</p>
        <span className="text-xs text-stone-400">{formatTime(order.createdAt)}</span>
      </div>
      <p className="mb-1 text-xs text-stone-500">
        {order.deliveryType === "entrega" ? "Entrega" : "Retirada"} · {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        {order.source === "manual" && " · manual"}
      </p>
      <ul className="mb-2 space-y-0.5 text-xs text-stone-600">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>
      <p className="mb-2 text-sm font-semibold text-stone-800">{formatBRL(order.total)}</p>
      {order.notes && <p className="mb-2 text-xs italic text-stone-500">&quot;{order.notes}&quot;</p>}

      <div className="flex gap-2">
        {next && (
          <form action={updateOrderStatusAction}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={next} />
            <button
              type="submit"
              className="rounded-lg bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600"
            >
              Mover para {ORDER_STATUS_LABELS[next]}
            </button>
          </form>
        )}
        {order.status !== "cancelado" && order.status !== "entregue" && (
          <form action={updateOrderStatusAction}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value="cancelado" />
            <button type="submit" className="text-xs text-red-500 hover:text-red-700">
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function PedidosPage() {
  const orders = await listOrders();

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {COLUMNS.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="rounded-xl bg-stone-50 p-3">
              <h2 className="mb-3 text-sm font-semibold text-stone-600">
                {ORDER_STATUS_LABELS[status]} ({columnOrders.length})
              </h2>
              {columnOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {columnOrders.length === 0 && (
                <p className="text-xs text-stone-400">Nenhum pedido.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
