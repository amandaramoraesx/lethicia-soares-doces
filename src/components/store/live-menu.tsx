"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { normalizeProduct, type Product } from "@/lib/types";
import ProductCard from "@/components/store/product-card";

export default function LiveMenu({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const unsub = onSnapshot(collection(getClientDb(), "products"), (snap) => {
      const all = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
      setProducts(all.filter((p) => p.active));
    });
    return () => unsub();
  }, []);

  if (products.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-stone-400">
        Nenhum doce disponível no momento. Volte em breve! 💗
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
