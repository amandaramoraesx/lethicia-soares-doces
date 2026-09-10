"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { normalizeOrderCatalogItem, ORDER_CATALOG_CATEGORY_LABELS, type OrderCatalogItem } from "@/lib/types";
import OrderCatalogCard from "@/components/store/order-catalog-card";

export default function OrderCatalogGrid({
  initialItems,
  whatsapp,
}: {
  initialItems: OrderCatalogItem[];
  whatsapp: string;
}) {
  const [items, setItems] = useState<OrderCatalogItem[]>(initialItems);

  useEffect(() => {
    const unsub = onSnapshot(collection(getClientDb(), "orderCatalogItems"), (snap) => {
      const all = snap.docs.map((d) => normalizeOrderCatalogItem(d.id, d.data()));
      setItems(all.filter((i) => i.active));
    });
    return () => unsub();
  }, []);

  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-stone-400">
        Nenhuma opção de encomenda cadastrada no momento. Volte em breve! 💗
      </p>
    );
  }

  if (!whatsapp) {
    return (
      <p className="mt-10 text-center text-sm text-stone-400">
        Encomendas indisponíveis no momento. Entre em contato com a loja.
      </p>
    );
  }

  const categories = Object.keys(ORDER_CATALOG_CATEGORY_LABELS) as (keyof typeof ORDER_CATALOG_CATEGORY_LABELS)[];

  return (
    <div className="space-y-8">
      <p className="text-center text-sm text-stone-500">
        Dá uma olhada nas opções e recheios disponíveis. O pedido é combinado direto com a gente pelo
        WhatsApp — data, tamanho e detalhes! 🎂
      </p>
      {categories.map((category) => {
        const categoryItems = items.filter((i) => i.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <div key={category}>
            <h2 className="mb-3 font-script text-2xl text-pink-deep">{ORDER_CATALOG_CATEGORY_LABELS[category]}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryItems.map((item) => (
                <OrderCatalogCard key={item.id} item={item} whatsapp={whatsapp} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
