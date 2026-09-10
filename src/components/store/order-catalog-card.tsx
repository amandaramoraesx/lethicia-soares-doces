"use client";

import { useState } from "react";
import Image from "next/image";
import { waLink } from "@/lib/whatsapp";
import type { OrderCatalogItem } from "@/lib/types";

export default function OrderCatalogCard({ item, whatsapp }: { item: OrderCatalogItem; whatsapp: string }) {
  const [slide, setSlide] = useState(0);
  const photos = item.imageUrls;
  const orderLink = waLink(whatsapp, `Oi! Vi o "${item.name}" no cardápio e gostaria de fazer uma encomenda 🎂`);

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
          🎂
        </div>
      )}

      {photos.length === 1 && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src={photos[0]}
            alt={item.name}
            width={400}
            height={400}
            className="h-auto max-h-64 w-full rounded-xl object-contain"
            unoptimized
          />
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
                  alt={item.name}
                  width={300}
                  height={200}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>

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
        <p className="font-script text-lg leading-tight text-pink-deep">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 whitespace-pre-wrap text-xs text-stone-500">{item.description}</p>
        )}
        {orderLink && (
          <a
            href={orderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-pink-deep px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Fazer encomenda
          </a>
        )}
      </div>
    </div>
  );
}
