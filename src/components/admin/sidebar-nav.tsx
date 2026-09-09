"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", emoji: "🌸" },
  { href: "/admin/pedidos", label: "Pedidos", emoji: "🧾" },
  { href: "/admin/produtos", label: "Produtos", emoji: "🍰" },
  { href: "/admin/categorias", label: "Categorias", emoji: "🗂️" },
  { href: "/admin/estoque", label: "Estoque", emoji: "📦" },
  { href: "/admin/clientes", label: "Clientes & Fiado", emoji: "💌" },
  { href: "/admin/financeiro", label: "Financeiro", emoji: "💰" },
  { href: "/admin/configuracoes", label: "Configurações", emoji: "⚙️" },
];

export { NAV_ITEMS };

export default function SidebarNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1.5 overflow-x-auto border-b border-pink/40 bg-cream px-3 py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive(item.href)
                ? "bg-pink text-pink-deep"
                : "bg-white text-stone-600 hover:bg-pink/50"
            }`}
          >
            {item.emoji} {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive(item.href)
              ? "bg-pink text-pink-deep shadow-sm"
              : "text-stone-500 hover:bg-pink/40 hover:text-pink-deep"
          }`}
        >
          <span className="text-base">{item.emoji}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
