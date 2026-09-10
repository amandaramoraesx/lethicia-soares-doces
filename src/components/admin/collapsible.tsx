"use client";

import { useState, type ReactNode } from "react";

export default function Collapsible({
  titulo,
  resumo,
  children,
  defaultAberto = true,
}: {
  titulo: string;
  resumo: string;
  children: ReactNode;
  defaultAberto?: boolean;
}) {
  const [aberto, setAberto] = useState(defaultAberto);
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <button onClick={() => setAberto((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="text-sm font-medium text-stone-800">{titulo}</p>
          <p className="text-xs text-stone-400">{resumo}</p>
        </div>
        <span className={`text-stone-400 transition-transform ${aberto ? "rotate-180" : ""}`}>▾</span>
      </button>
      {aberto && <div className="mt-3 border-t border-stone-100 pt-3">{children}</div>}
    </div>
  );
}
