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
      <div className="mb-6 flex gap-1 rounded-full bg-white p-1 ring-1 ring-pink/30">
        <button
          onClick={() => setTab("pronta")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            tab === "pronta" ? "bg-pink-deep text-white" : "text-stone-500 hover:text-pink-deep"
          }`}
        >
          Pronta entrega
        </button>
        <button
          onClick={() => setTab("encomenda")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            tab === "encomenda" ? "bg-pink-deep text-white" : "text-stone-500 hover:text-pink-deep"
          }`}
        >
          Encomendas de bolos e docinhos 🎂
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
