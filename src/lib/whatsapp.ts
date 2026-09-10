import { PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

export function waLink(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lethicia-soares-doces.vercel.app";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mesma mensagem usada ao aceitar o pedido — reaproveitada pelo botão de
// WhatsApp nos pedidos já confirmados, pra poder reenviar a confirmação.
export function buildOrderConfirmationMessage(order: Order, total: number, storeAddress: string): string {
  const itemsText = order.items.map((item) => `${item.quantity}x ${item.name}`).join("\n");
  const followUp =
    order.deliveryType === "entrega"
      ? "Em breve te enviamos por aqui o código de acompanhamento e os dados da entrega 📦"
      : `Pode retirar em: ${storeAddress || "vamos combinar o endereço por aqui"} 📍`;
  return `Oi ${order.customerName}! Seu pedido #${order.id.slice(0, 6)} foi confirmado ✅\n\n${itemsText}\n\nTotal: ${formatBRL(total)}\nPagamento: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}\n\n${followUp}`;
}
