import { listCategories } from "@/lib/db/categories";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/categories";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const categories = await listCategories();
  const editing = edit ? categories.find((c) => c.id === edit) : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Categorias</h1>

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 text-sm font-semibold text-stone-700">
          {editing ? `Editando: ${editing.name}` : "Nova categoria"}
        </h2>
        <form action={saveCategoryAction} className="flex flex-wrap items-end gap-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
            <input
              name="name"
              required
              defaultValue={editing?.name ?? ""}
              className="w-56 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Ordem</label>
            <input
              type="number"
              name="order"
              defaultValue={editing?.order ?? categories.length}
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="mb-2 flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              name="active"
              defaultChecked={editing?.active ?? true}
              className="h-4 w-4"
            />
            Ativa
          </label>
          <button
            type="submit"
            className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
          >
            {editing ? "Salvar" : "Adicionar"}
          </button>
          {editing && (
            <a href="/admin/categorias" className="text-sm text-stone-500 hover:underline">
              cancelar
            </a>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Ordem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3">{category.order}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      category.active
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
                    }
                  >
                    {category.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/categorias?edit=${category.id}`}
                    className="mr-3 text-xs font-medium text-pink-600 hover:text-pink-700"
                  >
                    Editar
                  </a>
                  <form action={deleteCategoryAction} className="inline">
                    <input type="hidden" name="id" value={category.id} />
                    <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-400">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
