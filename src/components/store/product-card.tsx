"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stockControl && product.stockQty <= 0;

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-pink/30">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={88}
          height={88}
          className="h-22 w-22 shrink-0 rounded-xl object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-xl bg-cream-dark text-2xl">
          🍰
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <p className="text-sm font-semibold text-stone-700">{product.name}</p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-pink-deep">{formatBRL(product.price)}</span>
          <button
            onClick={() =>
              addItem({ productId: product.id, name: product.name, price: product.price })
            }
            disabled={outOfStock}
            className="rounded-full bg-pink px-3 py-1.5 text-xs font-semibold text-pink-deep transition hover:bg-pink-dark disabled:opacity-40"
          >
            {outOfStock ? "Esgotado" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
