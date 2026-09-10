"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

interface Row {
  productId: string;
  quantity: number;
}

export default function ManualOrderItems({ products }: { products: Product[] }) {
  const [rows, setRows] = useState<Row[]>([]);

  function addRow() {
    if (products.length === 0) return;
    setRows([...rows, { productId: products[0].id, quantity: 1 }]);
  }

  function updateRow(index: number, changes: Partial<Row>) {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  const total = rows.reduce((sum, row) => {
    const product = products.find((p) => p.id === row.productId);
    return sum + (product?.price ?? 0) * row.quantity;
  }, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-xs font-medium text-stone-600">Itens do pedido</label>
        <button
          type="button"
          onClick={addRow}
          disabled={products.length === 0}
          className="text-xs font-medium text-pink-600 hover:text-pink-700 disabled:opacity-40"
        >
          + adicionar item
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={row.productId}
              onChange={(e) => updateRow(index, { productId: e.target.value })}
              className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
              className="w-20 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              remover
            </button>
          </div>
        ))}
        {rows.length === 0 && products.length === 0 && (
          <p className="text-xs text-red-500">
            Nenhum produto cadastrado ainda — cadastre um produto antes de criar um pedido.
          </p>
        )}
        {rows.length === 0 && products.length > 0 && (
          <p className="text-xs text-stone-400">Nenhum item adicionado.</p>
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-stone-600">
        Subtotal: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <input type="hidden" name="items" value={JSON.stringify(rows)} />
    </div>
  );
}
