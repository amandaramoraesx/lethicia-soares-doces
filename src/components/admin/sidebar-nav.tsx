"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", emoji: "🌸" },
  { href: "/admin/clientes", label: "Clientes", emoji: "💌" },
  { href: "/admin/pedidos", label: "Pedidos", emoji: "🧾" },
  { href: "/admin/produtos", label: "Doces", emoji: "🍰" },
  { href: "/admin/estoque", label: "Estoque", emoji: "📦" },
  { href: "/admin/financeiro", label: "Financeiro", emoji: "💰" },
  { href: "/admin/configuracoes", label: "Configurações", emoji: "⚙️" },
];

export { NAV_ITEMS };

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const isActive = useIsActive();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
            isActive(item.href)
              ? "bg-pink text-pink-deep shadow-sm"
              : "text-stone-500 hover:bg-pink/40 hover:text-pink-deep"
          }`}
        >
          <span className="text-lg">{item.emoji}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DesktopSidebarNav() {
  return <NavLinks />;
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="flex h-9 w-9 flex-col items-center justify-center gap-1"
      >
        <span className="block h-0.5 w-5 bg-pink-deep" />
        <span className="block h-0.5 w-5 bg-pink-deep" />
        <span className="block h-0.5 w-5 bg-pink-deep" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-cream p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Lethícia Soares Doces" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="font-script text-2xl leading-tight text-pink-deep">Lethícia Soares</p>
                  <p className="text-xs text-stone-400">Painel 🌷</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-xl text-stone-400"
              >
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
