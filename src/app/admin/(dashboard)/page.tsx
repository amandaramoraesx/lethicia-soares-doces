import { listOrders } from "@/lib/db/orders";
import { getStoreSettings, startOfTodayBrazilISO } from "@/lib/db/settings";
import { getOrderStatusLabel } from "@/lib/types";
import StoreStatusBadge from "@/components/admin/store-status-badge";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const [orders, settings] = await Promise.all([listOrders(), getStoreSettings()]);
  const todayISO = startOfTodayBrazilISO();
  const todayOrders = orders.filter((o) => o.createdAt >= todayISO && o.status !== "cancelado");

  const totalVendidoHoje = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pedidosHoje = todayOrders.length;

  const productCount = new Map<string, { name: string; qty: number }>();
  for (const order of orders) {
    if (order.status === "cancelado") continue;
    for (const item of order.items) {
      const current = productCount.get(item.productId) ?? { name: item.name, qty: 0 };
      current.qty += item.quantity;
      productCount.set(item.productId, current);
    }
  }
  const topProducts = Array.from(productCount.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const pendingOrders = orders.filter(
    (o) => o.status === "recebido" || o.status === "preparo" || o.status === "saiu_entrega"
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-800">Dashboard</h1>
        <StoreStatusBadge settings={settings} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Pedidos hoje</p>
          <p className="mt-1 text-2xl font-semibold text-stone-800">{pedidosHoje}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Total vendido hoje</p>
          <p className="mt-1 text-2xl font-semibold text-stone-800">{formatBRL(totalVendidoHoje)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Pedidos em andamento</p>
          <p className="mt-1 text-2xl font-semibold text-stone-800">{pendingOrders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Produtos mais pedidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-stone-400">Ainda não há pedidos suficientes.</p>
          ) : (
            <ul className="space-y-2">
              {topProducts.map((p) => (
                <li key={p.name} className="flex justify-between text-sm">
                  <span className="text-stone-700">{p.name}</span>
                  <span className="font-medium text-stone-500">{p.qty} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Últimos pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhum pedido ainda.</p>
          ) : (
            <ul className="space-y-2">
              {orders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex justify-between text-sm">
                  <span className="text-stone-700">
                    {order.customerName || "Cliente"} — {getOrderStatusLabel(order.status, order.deliveryType)}
                  </span>
                  <span className="font-medium text-stone-500">{formatBRL(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
