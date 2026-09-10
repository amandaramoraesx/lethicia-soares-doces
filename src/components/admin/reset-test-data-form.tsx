"use client";

import { useState } from "react";
import { resetTestDataAction } from "@/actions/reset";

const CONFIRMATION_WORD = "APAGAR";

export default function ResetTestDataForm() {
  const [value, setValue] = useState("");
  const enabled = value.trim().toUpperCase() === CONFIRMATION_WORD;

  return (
    <form
      action={resetTestDataAction}
      onSubmit={(e) => {
        if (!enabled) {
          e.preventDefault();
          return;
        }
        if (!window.confirm("Tem certeza? Isso vai apagar Pedidos, Encomendas e todo o Financeiro. Não pode ser desfeito.")) {
          e.preventDefault();
        }
      }}
      className="space-y-3"
    >
      <label className="block text-xs font-medium text-stone-600">
        Digite <span className="font-mono font-semibold text-red-600">{CONFIRMATION_WORD}</span> para confirmar
      </label>
      <input
        type="text"
        name="confirmation"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={CONFIRMATION_WORD}
        autoComplete="off"
        className="w-full max-w-xs rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!enabled}
        className="block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        🗑️ Apagar dados de teste
      </button>
    </form>
  );
}
