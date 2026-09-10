import Image from "next/image";
import { listProducts } from "@/lib/db/products";
import { getStoreSettings } from "@/lib/db/settings";
import { saveProductAction, deleteProductAction, toggleProductActiveAction } from "@/actions/products";
import ProductPhotosEditor from "@/components/admin/product-photos-editor";
import FormToggle from "@/components/admin/form-toggle";
import StoreOpenToggle from "@/components/admin/store-open-toggle";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  const { edit, saved } = await searchParams;
  const [products, settings] = await Promise.all([listProducts(), getStoreSettings()]);
  const editing = edit ? products.find((p) => p.id === edit) : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-800">Doces</h1>
        <StoreOpenToggle manuallyClosed={settings.manuallyClosed} />
      </div>

      {saved === "1" && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          ✓ Alterações salvas com sucesso!
        </p>
      )}

      <FormToggle editing={!!editing} label="Novo doce" key={editing?.id ?? "new"}>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
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

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">Fotos</label>
              <ProductPhotosEditor initialUrls={editing?.imageUrls ?? []} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Estoque (unidades)</label>
              <input
                type="number"
                min="0"
                name="stockQty"
                defaultValue={editing?.stockQty ?? 0}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-stone-400">
                Zero = aparece &quot;Indisponível hoje&quot; pro cliente. Qualquer valor acima disso, fica disponível.
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                {editing ? "Salvar alterações" : "Cadastrar doce"}
              </button>
              <a href="/admin/produtos" className="text-sm text-stone-500 hover:underline">
                cancelar
              </a>
            </div>
          </form>
        </div>
      </FormToggle>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-wrap items-center gap-4 border-b border-stone-100 px-4 py-4 last:border-0"
          >
            {product.imageUrls[0] ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                width={72}
                height={72}
                className="h-18 w-18 shrink-0 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                🍰
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-stone-800">{product.name}</p>
              {product.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-stone-400">{product.description}</p>
              )}
              <p className="mt-1 text-sm text-stone-500">
                {formatBRL(product.price)} · estoque {product.stockQty}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <form action={toggleProductActiveAction}>
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="active" value={(!product.active).toString()} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    product.active
                      ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600"
                      : "bg-stone-100 text-stone-500 hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {product.active ? "Esgotar" : "Disponibilizar"}
                </button>
              </form>
              <div className="flex flex-col items-end gap-3 text-xs">
                <a href={`/admin/produtos?edit=${product.id}`} className="font-medium text-pink-600 hover:text-pink-700">
                  Editar
                </a>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    aria-label={`Excluir ${product.name}`}
                    title="Excluir"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-stone-400">Nenhum doce cadastrado.</p>
        )}
      </div>
    </div>
  );
}
