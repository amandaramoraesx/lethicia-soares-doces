"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteCustomerAction } from "@/actions/customers";
import type { Customer } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CustomerList({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
    : customers;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Buscar por nome ou telefone..."
        className="mb-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm sm:max-w-xs"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((customer) => (
          <div key={customer.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
            <Link href={`/admin/clientes/${customer.id}`} className="block truncate font-medium text-pink-700 hover:underline">
              {customer.name}
            </Link>
            <p className="mt-1 truncate text-sm text-stone-500">{customer.phone}</p>
            {customer.fiadoBalance > 0 && (
              <p className="mt-1 text-xs font-medium text-amber-600">Fiado: {formatBRL(customer.fiadoBalance)}</p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs">
              <a href={`/admin/clientes?edit=${customer.id}`} className="font-medium text-pink-600 hover:text-pink-700">
                Editar
              </a>
              <form action={deleteCustomerAction}>
                <input type="hidden" name="id" value={customer.id} />
                <button
                  type="submit"
                  aria-label={`Excluir ${customer.name}`}
                  title="Excluir"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  🗑️
                </button>
              </form>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-stone-400">
            {customers.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado."}
          </p>
        )}
      </div>
    </div>
  );
}
