"use client";

import { useState } from "react";
import LiveMenu from "@/components/store/live-menu";
import OrderCatalogGrid from "@/components/store/order-catalog-grid";
import type { OrderCatalogItem, Product } from "@/lib/types";

type Tab = "pronta" | "encomenda";

export default function MenuTabs({
  products,
  catalogItems,
  whatsapp,
}: {
  products: Product[];
  catalogItems: OrderCatalogItem[];
  whatsapp: string;
}) {
  const [tab, setTab] = useState<Tab>("pronta");

  return (
    <div>
      <div className="mb-8 flex items-start justify-center gap-10 border-b border-pink/30">
        <button
          onClick={() => setTab("pronta")}
          className={`relative pb-3 text-sm font-medium transition ${
            tab === "pronta" ? "text-pink-deep" : "text-stone-400 hover:text-pink-deep"
          }`}
        >
          Pronta entrega
          {tab === "pronta" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-pink-deep" />
          )}
        </button>
        <button
          onClick={() => setTab("encomenda")}
          className={`relative flex flex-col items-center pb-3 transition ${
            tab === "encomenda" ? "text-pink-deep" : "text-stone-400 hover:text-pink-deep"
          }`}
        >
          <span className="text-sm font-medium">Cardápio bolos e docinhos</span>
          <span className="text-[10px] font-normal tracking-wide text-stone-400">sob encomenda</span>
          {tab === "encomenda" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-pink-deep" />
          )}
        </button>
      </div>

      {tab === "pronta" ? (
        <LiveMenu initialProducts={products} whatsapp={whatsapp} />
      ) : (
        <OrderCatalogGrid initialItems={catalogItems} whatsapp={whatsapp} />
      )}
    </div>
  );
}
