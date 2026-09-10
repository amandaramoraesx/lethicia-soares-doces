import Image from "next/image";
import { listProducts } from "@/lib/db/products";
import { listIngredients } from "@/lib/db/ingredients";
import { saveProductAction, deleteProductAction } from "@/actions/products";
import RecipeEditor from "@/components/admin/recipe-editor";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const [products, ingredients] = await Promise.all([
    listProducts(),
    listIngredients(),
  ]);
  const editing = edit ? products.find((p) => p.id === edit) : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Produtos</h1>

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 text-sm font-semibold text-stone-700">
          {editing ? `Editando: ${editing.name}` : "Novo produto"}
        </h2>
        <form action={saveProductAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
            <input
              name="name"
              required
              defaultValue={editing?.name ?? ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-stone-600">Descrição</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={editing?.description ?? ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              required
              defaultValue={editing?.price ?? ""}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">URL da foto</label>
            <input
              name="imageUrl"
              defaultValue={editing?.imageUrl ?? ""}
              placeholder="https://..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" name="active" defaultChecked={editing?.active ?? true} className="h-4 w-4" />
              Disponível
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} className="h-4 w-4" />
              Destaque
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                name="stockControl"
                defaultChecked={editing?.stockControl ?? false}
                className="h-4 w-4"
              />
              Controlar estoque por unidade
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Estoque (unidades)</label>
            <input
              type="number"
              name="stockQty"
              defaultValue={editing?.stockQty ?? 0}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <RecipeEditor ingredients={ingredients} initialRecipe={editing?.recipe ?? []} />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              {editing ? "Salvar alterações" : "Cadastrar produto"}
            </button>
            {editing && (
              <a href="/admin/produtos" className="text-sm text-stone-500 hover:underline">
                cancelar
              </a>
            )}
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs font-semibold uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-stone-100">
                <td className="flex items-center gap-3 px-4 py-3">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-pink-50" />
                  )}
                  <div>
                    <p className="font-medium text-stone-700">{product.name}</p>
                    {product.featured && <span className="text-xs text-pink-500">Destaque</span>}
                  </div>
                </td>
                <td className="px-4 py-3">{formatBRL(product.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.active
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
                    }
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/produtos?edit=${product.id}`}
                    className="mr-3 text-xs font-medium text-pink-600 hover:text-pink-700"
                  >
                    Editar
                  </a>
                  <form action={deleteProductAction} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
