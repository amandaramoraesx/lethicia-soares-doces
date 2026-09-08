import Link from "next/link";
import { listCustomers } from "@/lib/db/customers";
import { saveCustomerAction, deleteCustomerAction } from "@/actions/customers";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClientesPage() {
  const customers = await listCustomers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Clientes</h1>

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 text-sm font-semibold text-stone-700">Novo cliente</h2>
        <form action={saveCustomerAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
            <input name="name" required className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Telefone</label>
            <input name="phone" required className="w-40 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Endereço</label>
            <input name="address" className="w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Saldo fiado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/clientes/${customer.id}`} className="font-medium text-pink-700 hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">
                  {customer.fiadoBalance > 0 ? (
                    <span className="font-medium text-amber-600">{formatBRL(customer.fiadoBalance)}</span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCustomerAction} className="inline">
                    <input type="hidden" name="id" value={customer.id} />
                    <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-400">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
