import { listIngredients } from "@/lib/db/ingredients";
import { listProducts } from "@/lib/db/products";
import { saveIngredientAction, deleteIngredientAction } from "@/actions/ingredients";
import FormToggle from "@/components/admin/form-toggle";

const UNIT_LABELS: Record<string, string> = { un: "unidade", kg: "kg", g: "g", l: "litro", ml: "ml" };

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [ingredients, products] = await Promise.all([listIngredients(), listProducts()]);
  const editing = edit ? ingredients.find((i) => i.id === edit) : null;
  const lowStock = ingredients.filter((i) => i.stockQty <= i.minStockQty);
  const lowStockProducts = products.filter((p) => p.stockControl && p.stockQty <= 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Estoque</h1>

      {(lowStock.length > 0 || lowStockProducts.length > 0) && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="mb-1 font-semibold">⚠️ Alertas de reposição</p>
          <ul className="list-inside list-disc space-y-0.5">
            {lowStock.map((i) => (
              <li key={i.id}>
                {i.name}: {i.stockQty} {UNIT_LABELS[i.unit]} (mínimo {i.minStockQty})
              </li>
            ))}
            {lowStockProducts.map((p) => (
              <li key={p.id}>{p.name}: sem estoque</li>
            ))}
          </ul>
        </div>
      )}

      <FormToggle editing={!!editing} label="Novo insumo" key={editing?.id ?? "new"}>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
            {editing ? `Editando: ${editing.name}` : "Novo insumo"}
          </h2>
          <form action={saveIngredientAction} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Unidade</label>
              <select
                name="unit"
                defaultValue={editing?.unit ?? "un"}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                {Object.entries(UNIT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Custo/un. (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPerUnit"
                defaultValue={editing?.costPerUnit ?? 0}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Estoque atual</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="stockQty"
                defaultValue={editing?.stockQty ?? 0}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Estoque mínimo</label>
              <input
                type="number"
                step="0.001"
                min="0"
                name="minStockQty"
                defaultValue={editing?.minStockQty ?? 0}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-5 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                {editing ? "Salvar" : "Adicionar insumo"}
              </button>
              {editing && (
                <a href="/admin/estoque" className="text-sm text-stone-500 hover:underline">
                  cancelar
                </a>
              )}
            </div>
          </form>
        </div>
      </FormToggle>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-stone-700">{ingredient.name}</p>
              <p className="text-xs text-stone-400">
                {ingredient.stockQty} {UNIT_LABELS[ingredient.unit]} · mín. {ingredient.minStockQty}{" "}
                {UNIT_LABELS[ingredient.unit]} · {formatBRL(ingredient.costPerUnit)}/{UNIT_LABELS[ingredient.unit]}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3 text-xs">
              <a href={`/admin/estoque?edit=${ingredient.id}`} className="font-medium text-pink-600 hover:text-pink-700">
                Editar
              </a>
              <form action={deleteIngredientAction}>
                <input type="hidden" name="id" value={ingredient.id} />
                <button
                  type="submit"
                  aria-label={`Excluir ${ingredient.name}`}
                  title="Excluir"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  🗑️
                </button>
              </form>
            </div>
          </div>
        ))}
        {ingredients.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-stone-400">Nenhum insumo cadastrado.</p>
        )}
      </div>
    </div>
  );
}
