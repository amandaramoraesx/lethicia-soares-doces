import type { ReactNode } from "react";
import Image from "next/image";
import { requireAdmin } from "@/lib/session";
import { logout } from "@/actions/auth";
import NewOrderWatcher from "@/components/admin/new-order-watcher";
import { DesktopSidebarNav, MobileMenuButton } from "@/components/admin/sidebar-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream-dark/40 text-stone-800">
      <aside className="hidden w-60 flex-col border-r border-pink/40 bg-cream p-4 md:flex">
        <div className="mb-6 flex flex-col items-center px-2 text-center">
          <Image
            src="/logo.png"
            alt="Lethícia Soares Doces"
            width={72}
            height={72}
            className="mb-2 h-18 w-18 rounded-full object-cover"
          />
          <p className="font-script text-3xl text-pink-deep">Lethícia Soares</p>
          <p className="text-xs text-stone-400">Painel administrativo 🌷</p>
        </div>
        <DesktopSidebarNav />
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-400 transition hover:bg-white hover:text-pink-deep"
          >
            🚪 Sair
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-pink/40 bg-cream px-4 py-3 md:hidden">
          <MobileMenuButton />
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Lethícia Soares Doces" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
            <p className="font-script text-2xl text-pink-deep">Lethícia Soares</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs font-medium text-stone-400">
              🚪 Sair
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
      <NewOrderWatcher />
    </div>
  );
}
