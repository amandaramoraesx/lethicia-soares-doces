"use client";

import { useState } from "react";
import { acceptOrderAction } from "@/actions/orders";
import { waLink } from "@/lib/whatsapp";
import { PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AcceptOrderForm({
  order,
  suggestedFee,
  storeAddress,
}: {
  order: Order;
  suggestedFee: number;
  storeAddress: string;
}) {
  const [fee, setFee] = useState(suggestedFee);
  const [loading, setLoading] = useState(false);

  async function handleAccept(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    // Abre a aba em branco AGORA (ainda dentro do clique do usuário) e só define o
    // destino depois que o pedido for aceito — abrir depois de um await costuma ser
    // bloqueado como pop-up pelo navegador.
    const popup = order.customerPhone ? window.open("", "_blank") : null;

    const formData = new FormData();
    formData.set("id", order.id);
    formData.set("deliveryFee", String(fee));
    await acceptOrderAction(formData);

    if (popup) {
      const itemsText = order.items.map((item) => `${item.quantity}x ${item.name}`).join("\n");
      const total = order.subtotal + (order.deliveryType === "entrega" ? fee : 0);
      const followUp =
        order.deliveryType === "entrega"
          ? "Em breve te enviamos por aqui o código de acompanhamento e os dados da entrega 📦"
          : `Pode retirar em: ${storeAddress || "vamos combinar o endereço por aqui"} 📍`;
      const message = `Oi ${order.customerName}! Seu pedido #${order.id.slice(0, 6)} foi confirmado ✅\n\n${itemsText}\n\nTotal: ${formatBRL(total)}\nPagamento: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}\n\n${followUp}`;
      const link = waLink(order.customerPhone, message);
      if (link) {
        popup.location.href = link;
      } else {
        popup.close();
      }
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleAccept} className="mb-2 flex flex-wrap items-center gap-2">
      {order.deliveryType === "entrega" && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-500">Taxa R$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-xs"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? "Aceitando..." : "✓ Aceitar pedido"}
      </button>
    </form>
  );
}
