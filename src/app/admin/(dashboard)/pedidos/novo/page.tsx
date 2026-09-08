import { listAvailableProducts } from "@/lib/db/products";
import { createManualOrderAction } from "@/actions/orders";
import ManualOrderItems from "@/components/admin/manual-order-items";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";

export default async function NovoPedidoPage() {
  const products = await listAvailableProducts();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Novo pedido manual</h1>

      <form
        action={createManualOrderAction}
        className="max-w-xl space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Nome do cliente</label>
          <input
            name="customerName"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Telefone</label>
          <input
            name="customerPhone"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Entrega</label>
            <select
              name="deliveryType"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="retirada">Retirada</option>
              <option value="entrega">Entrega</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Taxa de entrega (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="deliveryFee"
              defaultValue={0}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Endereço (se entrega)</label>
          <input
            name="address"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Forma de pagamento</label>
          <select
            name="paymentMethod"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">
            Fiado gera automaticamente uma conta a receber para o cliente.
          </p>
        </div>

        <ManualOrderItems products={products} />

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Observações</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
        >
          Registrar pedido
        </button>
      </form>
    </div>
  );
}
