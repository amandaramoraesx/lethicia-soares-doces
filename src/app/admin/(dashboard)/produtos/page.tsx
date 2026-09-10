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
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Doces</h1>

      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 text-sm font-semibold text-stone-700">
          {editing ? `Editando: ${editing.name}` : "Novo doce"}
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
            <label className="mb-1 block text-xs font-medium text-stone-600">Foto</label>
            <input type="hidden" name="existingImageUrl" value={editing?.imageUrl ?? ""} />
            <div className="flex items-center gap-3">
              {editing?.imageUrl && (
                <Image
                  src={editing.imageUrl}
                  alt={editing.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  unoptimized
                />
              )}
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-pink-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-pink-600"
              />
            </div>
            {editing?.imageUrl && (
              <p className="mt-1 text-xs text-stone-400">Escolha uma nova foto só se quiser trocar.</p>
            )}
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
              {editing ? "Salvar alterações" : "Cadastrar doce"}
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
              <th className="px-4 py-3">Doce</th>
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
                  Nenhum doce cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
