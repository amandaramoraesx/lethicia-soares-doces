"use client";

import { useState } from "react";

// Listas fixas conforme o cardápio impresso (bolos e docinhos).
// Se os sabores ou preços do cardápio mudarem, atualize aqui também.
const RECHEIOS_SIMPLES = [
  "Brigadeiro",
  "Prestígio",
  "Doce de leite",
  "Leite ninho",
  "Leite ninho com morangos",
  "Churros",
];

const RECHEIOS_ESPECIAIS = [
  "Brigadeiro de nutella",
  "Ninho com nutella",
  "Sonho de valsa",
  "Ouro branco",
  "Oreo",
  "Brigadeiro gourmet ao leite",
  "Chocolate branco",
];

const TAMANHOS = [
  { value: "PP", label: "PP (10 a 12 fatias)" },
  { value: "P", label: "P (15 a 18 fatias)" },
  { value: "M", label: "M (25 a 30 fatias)" },
  { value: "G", label: "G (35 a 45 fatias)" },
  { value: "GG", label: "GG (45 a 55 fatias)" },
];

const DOCINHO_GRUPOS = [
  { label: "R$ 140,00 (100 un)", sabores: ["Brigadeiro tradicional", "Beijinho", "Casadinho", "Leite ninho"] },
  { label: "R$ 160,00 (100 un)", sabores: ["Churros", "Bicho de pé", "Oreo", "Paçoca"] },
  { label: "R$ 190,00 (100 un)", sabores: ["Brigadeiro ao leite", "Chocolate branco", "Mesclado", "Prestígio"] },
  { label: "R$ 210,00 (100 un)", sabores: ["Leite ninho com nutella", "Leite ninho com uva"] },
];

function RecheioSelect({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-stone-600">{label}</label>
      <select name={name} required={required} defaultValue="" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
        <option value="">{required ? "Selecione..." : "Nenhum"}</option>
        <optgroup label="Recheios simples">
          {RECHEIOS_SIMPLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </optgroup>
        <optgroup label="Recheios especiais">
          {RECHEIOS_ESPECIAIS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}

type Modo = "bolo" | "docinho" | "outro";

export default function BoloOrderFields({ initialDoceName }: { initialDoceName?: string }) {
  const [modo, setModo] = useState<Modo>(initialDoceName ? "outro" : "bolo");

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-stone-600">Tipo de item</label>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setModo("bolo")}
          className={`rounded-lg border px-2 py-2 text-sm ${
            modo === "bolo" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-stone-300 text-stone-600"
          }`}
        >
          Bolo
        </button>
        <button
          type="button"
          onClick={() => setModo("docinho")}
          className={`rounded-lg border px-2 py-2 text-sm ${
            modo === "docinho" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-stone-300 text-stone-600"
          }`}
        >
          Docinhos
        </button>
        <button
          type="button"
          onClick={() => setModo("outro")}
          className={`rounded-lg border px-2 py-2 text-sm ${
            modo === "outro" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-stone-300 text-stone-600"
          }`}
        >
          Outro
        </button>
      </div>

      {modo === "bolo" && (
        <div className="space-y-3">
          <input type="hidden" name="itemType" value="bolo" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <RecheioSelect label="Recheio 1" name="recheioBolo1" required />
            <RecheioSelect label="Recheio 2 (opcional, até 2 no total)" name="recheioBolo2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Massa</label>
              <select name="massaBolo" defaultValue="Chocolate" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                <option value="Chocolate">Chocolate</option>
                <option value="Branca">Branca</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Tamanho</label>
              <select name="tamanhoBolo" required defaultValue="" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                <option value="">Selecione...</option>
                {TAMANHOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {modo === "docinho" && (
        <div className="space-y-3">
          <input type="hidden" name="itemType" value="docinho" />
          <p className="text-xs text-stone-500">Marque todos os sabores que fazem parte dessa encomenda.</p>
          {DOCINHO_GRUPOS.map((grupo) => (
            <div key={grupo.label}>
              <p className="mb-1.5 text-xs font-semibold text-pink-deep">{grupo.label}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
                {grupo.sabores.map((sabor) => (
                  <label key={sabor} className="flex items-center gap-1.5 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      name="docinhoSabor"
                      value={sabor}
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    {sabor}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modo === "outro" && (
        <div>
          <input type="hidden" name="itemType" value="outro" />
          <label className="mb-1 block text-xs font-medium text-stone-600">Doce / bolo</label>
          <input
            name="doceName"
            required
            defaultValue={initialDoceName ?? ""}
            placeholder="Ex: Cento de docinhos sortido"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
