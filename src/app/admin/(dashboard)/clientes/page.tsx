import Link from "next/link";
import { listCustomers } from "@/lib/db/customers";
import { saveCustomerAction } from "@/actions/customers";
import FormToggle from "@/components/admin/form-toggle";
import CustomerList from "@/components/admin/customer-list";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  const { edit, saved } = await searchParams;
  const customers = await listCustomers();
  const editing = edit ? customers.find((c) => c.id === edit) : null;
  const emAberto = customers.filter((c) => c.fiadoBalance > 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Clientes 💌</h1>

      {saved === "1" && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          ✓ Alterações salvas com sucesso!
        </p>
      )}

      {emAberto.length > 0 && (
        <div className="mb-8 rounded-xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <h2 className="mb-3 text-sm font-semibold text-amber-800">
            Em aberto (fiado) — {emAberto.length}
          </h2>
          <ul className="space-y-2">
            {emAberto.map((customer) => (
              <li key={customer.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/clientes/${customer.id}`} className="font-medium text-amber-900 hover:underline">
                  {customer.name}
                </Link>
                <span className="font-semibold text-amber-700">{formatBRL(customer.fiadoBalance)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormToggle editing={!!editing} label="Novo cliente" key={editing?.id ?? "new"}>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
            {editing ? `Editando: ${editing.name}` : "Novo cliente"}
          </h2>
          <form action={saveCustomerAction} className="space-y-5">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-deep">
                Dados do cliente
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
                  <input
                    name="name"
                    required
                    defaultValue={editing?.name ?? ""}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Telefone</label>
                  <input
                    name="phone"
                    required
                    defaultValue={editing?.phone ?? ""}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-deep">
                Endereço
              </p>
              {editing && editing.address && (
                <p className="mb-2 text-xs text-stone-400">
                  Endereço atual: {editing.address} — preencha os campos abaixo só se quiser
                  atualizar.
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-stone-600">Rua</label>
                  <input name="street" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">Número</label>
                  <input name="number" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600">CEP</label>
                  <input name="zipCode" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </div>
                <div className="sm:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-stone-600">Bairro / Vila</label>
                  <input
                    name="neighborhood"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm sm:w-1/2"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pink-deep">
                Observação interna
              </p>
              <textarea
                name="internalNote"
                rows={3}
                defaultValue={editing?.internalNote ?? ""}
                placeholder="Só você vê isso — ex: prefere entrega pela manhã, alergia a nozes, etc."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                {editing ? "Salvar alterações" : "Cadastrar cliente"}
              </button>
              <Link href="/admin/clientes" className="text-sm text-stone-500 hover:underline">
                cancelar
              </Link>
            </div>
          </form>
        </div>
      </FormToggle>

      <CustomerList customers={customers} />
    </div>
  );
}
