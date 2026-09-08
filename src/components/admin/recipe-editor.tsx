"use client";

import { useState } from "react";
import type { Ingredient, RecipeItem } from "@/lib/types";

export default function RecipeEditor({
  ingredients,
  initialRecipe,
}: {
  ingredients: Ingredient[];
  initialRecipe: RecipeItem[];
}) {
  const [rows, setRows] = useState<RecipeItem[]>(
    initialRecipe.length > 0 ? initialRecipe : []
  );

  function addRow() {
    if (ingredients.length === 0) return;
    setRows([...rows, { ingredientId: ingredients[0].id, quantity: 1 }]);
  }

  function updateRow(index: number, changes: Partial<RecipeItem>) {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-stone-700">
          Ficha técnica (insumos usados)
        </label>
        <button
          type="button"
          onClick={addRow}
          disabled={ingredients.length === 0}
          className="text-xs font-medium text-pink-600 hover:text-pink-700 disabled:opacity-40"
        >
          + adicionar insumo
        </button>
      </div>

      {ingredients.length === 0 && (
        <p className="mb-2 text-xs text-stone-400">
          Cadastre insumos em Estoque para montar a ficha técnica.
        </p>
      )}

      <div className="space-y-2">
        {rows.map((row, index) => {
          const ingredient = ingredients.find((i) => i.id === row.ingredientId);
          return (
            <div key={index} className="flex items-center gap-2">
              <select
                value={row.ingredientId}
                onChange={(e) => updateRow(index, { ingredientId: e.target.value })}
                className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                min="0"
                value={row.quantity}
                onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
                className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
              <span className="w-10 text-xs text-stone-500">{ingredient?.unit ?? ""}</span>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                remover
              </button>
            </div>
          );
        })}
      </div>

      <input type="hidden" name="recipe" value={JSON.stringify(rows)} />
    </div>
  );
}
