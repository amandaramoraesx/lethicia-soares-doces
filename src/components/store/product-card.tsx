"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { waLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product, whatsapp }: { product: Product; whatsapp: string }) {
  const { addItem } = useCart();
  const [slide, setSlide] = useState(0);
  const outOfStock = product.stockControl && product.stockQty <= 0;
  const photos = product.imageUrls;
  const orderLink = outOfStock
    ? waLink(whatsapp, `Oi! O doce "${product.name}" está indisponível hoje, mas gostaria de encomendar 🍰`)
    : null;

  function prevSlide(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSlide((s) => (s - 1 + photos.length) % photos.length);
  }

  function nextSlide(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSlide((s) => (s + 1) % photos.length);
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-pink/20 transition hover:shadow-md">
      {photos.length === 0 && (
        <div className="flex h-36 w-full items-center justify-center rounded-xl bg-cream-dark text-3xl">
          🍰
        </div>
      )}

      {photos.length === 1 && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src={photos[0]}
            alt={product.name}
            width={400}
            height={400}
            className="h-auto max-h-64 w-full rounded-xl object-contain"
            unoptimized
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                🙁 Indisponível hoje
              </span>
            </div>
          )}
        </div>
      )}

      {photos.length > 1 && (
        <div className="relative h-36 w-full overflow-hidden rounded-xl bg-white sm:h-40">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {photos.map((url, i) => (
              <div key={i} className="h-full w-full shrink-0">
                <Image
                  src={url}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                🙁 Indisponível hoje
              </span>
            </div>
          )}

          <button
            onClick={prevSlide}
            aria-label="Foto anterior"
            className="absolute left-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xs shadow"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            aria-label="Próxima foto"
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xs shadow"
          >
            ›
          </button>
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full bg-pink-deep transition-all ${
                  i === slide ? "w-3 opacity-100" : "w-1 opacity-40"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="pt-3">
        <p className="font-script text-lg leading-tight text-pink-deep">{product.name}</p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-stone-700">{formatBRL(product.price)}</span>
          {orderLink ? (
            <a
              href={orderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-lg bg-pink-deep px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Encomendar
            </a>
          ) : (
            <button
              onClick={() =>
                addItem({ productId: product.id, name: product.name, price: product.price })
              }
              disabled={outOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-deep text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
