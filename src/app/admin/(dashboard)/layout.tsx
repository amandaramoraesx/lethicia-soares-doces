import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { logout } from "@/actions/auth";
import NewOrderWatcher from "@/components/admin/new-order-watcher";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/estoque", label: "Estoque" },
  { href: "/admin/clientes", label: "Clientes / Fiado" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      <aside className="hidden w-56 flex-col border-r border-stone-200 bg-white p-4 md:flex">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-stone-800">Lethícia Soares</p>
          <p className="text-xs text-stone-500">Painel administrativo</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-pink-50 hover:text-pink-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-500 transition hover:bg-stone-100"
          >
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <p className="text-sm font-semibold">Lethícia Soares — Painel</p>
          <form action={logout}>
            <button type="submit" className="text-xs font-medium text-stone-500">
              Sair
            </button>
          </form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-2 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-stone-600 hover:bg-pink-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
      <NewOrderWatcher />
    </div>
  );
}
