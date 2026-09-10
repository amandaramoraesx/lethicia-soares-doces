"use client";

import { deleteOrdersByStatusAction } from "@/actions/orders";
import type { OrderStatus } from "@/lib/types";

export default function DeleteAllOrdersButton({
  status,
  label,
}: {
  status: OrderStatus;
  label: string;
}) {
  return (
    <form
      action={deleteOrdersByStatusAction}
      onSubmit={(e) => {
        if (!confirm(`Apagar todos os pedidos de "${label}"? Isso não pode ser desfeito.`)) {
          e.preventDefault();
        }
      }}
      className="mb-2 flex justify-end"
    >
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="text-[11px] text-stone-400 underline hover:text-red-500">
        Apagar todos desta lista
      </button>
    </form>
  );
}
