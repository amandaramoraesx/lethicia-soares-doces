import Image from "next/image";
import { listOrderCatalogItems } from "@/lib/db/order-catalog";
import { saveOrderCatalogItemAction, deleteOrderCatalogItemAction } from "@/actions/order-catalog";
import ProductPhotosEditor from "@/components/admin/product-photos-editor";
import FormToggle from "@/components/admin/form-toggle";
import { ORDER_CATALOG_CATEGORY_LABELS } from "@/lib/types";

export default async function CatalogoEncomendasPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const items = await listOrderCatalogItems();
  const editing = edit ? items.find((i) => i.id === edit) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Catálogo de encomendas</h1>
        <p className="mt-1 text-sm text-stone-500">
          Bolos e docinhos que aparecem na aba &quot;Encomendas&quot; do cardápio, só para o cliente
          ver as opções e recheios — sem preço fixo nem carrinho. O pedido é combinado por WhatsApp.
        </p>
      </div>

      <FormToggle editing={!!editing} label="Novo item" key={editing?.id ?? "new"}>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">
            {editing ? `Editando: ${editing.name}` : "Novo item"}
          </h2>
          <form action={saveOrderCatalogItemAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Nome</label>
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder="Ex: Bolo de ninho"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Categoria</label>
              <select
                name="category"
                defaultValue={editing?.category ?? "bolo"}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                {Object.entries(ORDER_CATALOG_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Descrição / recheios disponíveis
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ""}
                placeholder="Ex: Recheios: ninho, brigadeiro, morango. Serve de 15 a 20 pessoas."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">Fotos</label>
              <ProductPhotosEditor initialUrls={editing?.imageUrls ?? []} />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                defaultChecked={editing?.active ?? true}
                className="h-4 w-4 rounded border-stone-300"
              />
              <label htmlFor="active" className="text-sm text-stone-600">
                Visível no cardápio
              </label>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                {editing ? "Salvar alterações" : "Adicionar item"}
              </button>
              <a href="/admin/catalogo-encomendas" className="text-sm text-stone-500 hover:underline">
                cancelar
              </a>
            </div>
          </form>
        </div>
      </FormToggle>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 border-b border-stone-100 px-4 py-4 last:border-0"
          >
            {item.imageUrls[0] ? (
              <Image
                src={item.imageUrls[0]}
                alt={item.name}
                width={72}
                height={72}
                className="h-18 w-18 shrink-0 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                🎂
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-stone-800">{item.name}</p>
              <p className="text-xs text-stone-500">
                {ORDER_CATALOG_CATEGORY_LABELS[item.category]}
                {!item.active && " · oculto"}
              </p>
              {item.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-stone-400">{item.description}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3 text-xs">
              <a
                href={`/admin/catalogo-encomendas?edit=${item.id}`}
                className="font-medium text-pink-600 hover:text-pink-700"
              >
                Editar
              </a>
              <form action={deleteOrderCatalogItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  aria-label={`Excluir ${item.name}`}
                  title="Excluir"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  🗑️
                </button>
              </form>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-stone-400">Nenhum item cadastrado.</p>
        )}
      </div>
    </div>
  );
}
