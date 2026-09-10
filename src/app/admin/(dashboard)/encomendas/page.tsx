import Link from "next/link";
import { listCustomOrders } from "@/lib/db/custom-orders";
import { listCustomers } from "@/lib/db/customers";
import { saveCustomOrderAction, markCustomOrderStatusAction, deleteCustomOrderAction } from "@/actions/custom-orders";
import FormToggle from "@/components/admin/form-toggle";
import type { CustomOrder } from "@/lib/types";

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("pt-BR");
}

function countdownLabel(isoDate: string): { text: string; className: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { text: `Atrasada ${Math.abs(diffDays)}d`, className: "bg-red-100 text-red-700" };
  if (diffDays === 0) return { text: "É hoje!", className: "bg-red-100 text-red-700" };
  if (diffDays === 1) return { text: "Amanhã", className: "bg-amber-100 text-amber-700" };
  if (diffDays <= 3) return { text: `Faltam ${diffDays}d`, className: "bg-amber-100 text-amber-700" };
  return { text: `Faltam ${diffDays}d`, className: "bg-stone-100 text-stone-500" };
}

function OrderRow({ order }: { order: CustomOrder }) {
  const countdown = countdownLabel(order.deliveryDate);
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-4 py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-stone-800">
          {order.doceName} — {order.quantity}
          {order.unit}
        </p>
        <p className="text-sm text-stone-500">
          {order.customerId ? (
            <Link href={`/admin/clientes/${order.customerId}`} className="text-pink-600 hover:underline">
              {order.customerName}
            </Link>
          ) : (
            "Sem cliente vinculado"
          )}{" "}
          · entrega {formatDate(order.deliveryDate)}
        </p>
        {order.notes && <p className="mt-0.5 text-xs italic text-stone-400">&quot;{order.notes}&quot;</p>}
      </div>

      {order.status === "pendente" && (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${countdown.className}`}>
          {countdown.text}
        </span>
      )}
      {order.status === "entregue" && (
        <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          Entregue
        </span>
      )}
      {order.status === "cancelada" && (
        <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
          Cancelada
        </span>
      )}

      <div className="flex shrink-0 items-center gap-3 text-xs">
        {order.status === "pendente" && (
          <form action={markCustomOrderStatusAction}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value="entregue" />
            <button type="submit" className="font-medium text-green-600 hover:text-green-700">
              Entregue
            </button>
          </form>
        )}
        <a href={`/admin/encomendas?edit=${order.id}`} className="font-medium text-pink-600 hover:text-pink-700">
          Editar
        </a>
        <form action={deleteCustomOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <button type="submit" className="font-medium text-red-500 hover:text-red-700">
            Excluir
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function EncomendasPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [orders, customers] = await Promise.all([listCustomOrders(), listCustomers()]);
  const editing = edit ? orders.find((o) => o.id === edit) : null;

  const pendentes = orders.filter((o) => o.status === "pendente");
  const outras = orders.filter((o) => o.status !== "pendente");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Encomendas 🎂</h1>

      <FormToggle editing={!!editing} label="Nova encomenda" key={editing?.id ?? "new"}>
        <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
            {editing ? `Editando encomenda` : "Nova encomenda"}
          </h2>
          <form action={saveCustomOrderAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Cliente (opcional)</label>
              <select
                name="customerId"
                defaultValue={editing?.customerId ?? ""}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">Sem cliente vinculado</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Doce / bolo</label>
              <input
                name="doceName"
                required
                defaultValue={editing?.doceName ?? ""}
                placeholder="Ex: Bolo de chocolate"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="quantity"
                  required
                  defaultValue={editing?.quantity ?? ""}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs font-medium text-stone-600">Unidade</label>
                <select
                  name="unit"
                  defaultValue={editing?.unit ?? "un"}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Data de entrega</label>
              <input
                type="date"
                name="deliveryDate"
                required
                defaultValue={editing?.deliveryDate ?? ""}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">Observação</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={editing?.notes ?? ""}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                {editing ? "Salvar alterações" : "Cadastrar encomenda"}
              </button>
              <a href="/admin/encomendas" className="text-sm text-stone-500 hover:underline">
                cancelar
              </a>
            </div>
          </form>
        </div>
      </FormToggle>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        {pendentes.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
        {pendentes.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-stone-400">Nenhuma encomenda pendente.</p>
        )}
      </div>

      {outras.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
          {outras.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
