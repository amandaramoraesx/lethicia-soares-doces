"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

export default function StoreHeader({
  storeName,
  logoUrl,
  isOpen,
  categories,
}: {
  storeName: string;
  logoUrl: string;
  isOpen: boolean;
  categories: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-pink/40 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1"
        >
          <span className="block h-0.5 w-5 bg-pink-deep" />
          <span className="block h-0.5 w-5 bg-pink-deep" />
          <span className="block h-0.5 w-5 bg-pink-deep" />
        </button>

        <div className="flex flex-col items-center">
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={40} height={40} className="mb-0.5 h-10 w-10 rounded-full object-cover" unoptimized />
          ) : null}
          <span className="font-script text-2xl text-pink-deep">{storeName}</span>
          <span
            className={`text-[11px] font-medium ${isOpen ? "text-green-600" : "text-stone-400"}`}
          >
            {isOpen ? "Aberto agora 🌸" : "Fechado no momento"}
          </span>
        </div>

        <button onClick={openDrawer} aria-label="Ver carrinho" className="relative flex h-9 w-9 items-center justify-center text-xl">
          🛍️
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-deep text-[10px] text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-pink/40 bg-cream px-4 py-3">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#categoria-${category.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-pink-deep shadow-sm"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
