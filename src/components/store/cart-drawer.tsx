"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="font-script text-2xl text-pink-deep">Seu carrinho 🧁</h2>
          <button onClick={closeDrawer} className="text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-stone-400">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-700">{item.name}</p>
                    <p className="text-xs text-stone-400">{formatBRL(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded-full bg-cream-dark text-sm"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded-full bg-cream-dark text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-1 text-xs text-red-400 hover:text-red-600"
                    >
                      remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-stone-100 px-4 py-4">
          <div className="mb-3 flex justify-between text-sm font-medium text-stone-700">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <Link
            href="/finalizar"
            onClick={closeDrawer}
            className={`block w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-white transition ${
              items.length === 0 ? "pointer-events-none bg-stone-300" : "bg-pink-deep hover:opacity-90"
            }`}
          >
            Finalizar pedido 💗
          </Link>
        </div>
      </div>
    </div>
  );
}
