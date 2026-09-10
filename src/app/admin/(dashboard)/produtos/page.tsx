import Image from "next/image";
import { listProducts } from "@/lib/db/products";
import { saveProductAction, deleteProductAction } from "@/actions/products";
import ProductPhotosEditor from "@/components/admin/product-photos-editor";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const products = await listProducts();
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
              Zero = aparece &quot;Esgotado&quot; pro cliente. Qualquer valor acima disso, fica disponível.
            </p>
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
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-0"
          >
            {product.imageUrls[0] ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
                unoptimized
              />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-lg bg-pink-50" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-stone-700">{product.name}</p>
              <p className="text-xs text-stone-400">
                {formatBRL(product.price)} · estoque {product.stockQty}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                product.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
              }`}
            >
              {product.active ? "Ativo" : "Esgotado"}
            </span>
            <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
              <a href={`/admin/produtos?edit=${product.id}`} className="font-medium text-pink-600 hover:text-pink-700">
                Editar
              </a>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <button type="submit" className="font-medium text-red-500 hover:text-red-700">
                  Excluir
                </button>
              </form>
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
