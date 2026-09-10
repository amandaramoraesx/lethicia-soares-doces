"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export default function StoreHeader({
  storeName,
  logoUrl,
  isOpen,
}: {
  storeName: string;
  logoUrl: string;
  isOpen: boolean;
}) {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-pink/40 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="h-9 w-9" />

        <div className="flex flex-col items-center">
          <Image
            src={logoUrl || "/logo.png"}
            alt={storeName}
            width={48}
            height={48}
            className="mb-0.5 h-12 w-12 rounded-full object-cover"
            unoptimized
          />
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
    </header>
  );
}
