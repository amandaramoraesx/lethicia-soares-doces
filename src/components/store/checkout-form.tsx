"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { saveLastOrderId } from "@/lib/order-tracking";
import { createCheckoutOrderAction } from "@/actions/checkout";
import { CHECKOUT_PAYMENT_METHODS_BY_DELIVERY, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CheckoutForm({ minOrder }: { minOrder: number }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<"retirada" | "entrega">("retirada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paymentOptions = CHECKOUT_PAYMENT_METHODS_BY_DELIVERY[deliveryType];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentOptions[0]);

  function changeDeliveryType(type: "retirada" | "entrega") {
    setDeliveryType(type);
    setPaymentMethod(CHECKOUT_PAYMENT_METHODS_BY_DELIVERY[type][0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const customerName = formData.get("customerName")?.toString() ?? "";

    setLoading(true);
    const result = await createCheckoutOrderAction({
      customerName,
      customerPhone: formData.get("customerPhone")?.toString() ?? "",
      deliveryType,
      address: formData.get("address")?.toString() ?? "",
      paymentMethod: formData.get("paymentMethod") as PaymentMethod,
      notes: formData.get("notes")?.toString() ?? "",
      items,
    });
    setLoading(false);

    if (result.error || !result.orderId) {
      setError(result.error ?? "Não foi possível criar o pedido.");
      return;
    }

    clearCart();
    saveLastOrderId(result.orderId);
    router.push(`/pedido/${result.orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-stone-500">Seu carrinho está vazio.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-full bg-pink-deep px-5 py-2 text-sm font-semibold text-white"
        >
          Ver cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-pink-deep">
        ← Voltar ao cardápio
      </Link>
      <h1 className="mb-4 font-script text-3xl text-pink-deep">Finalizar pedido 💗</h1>

      <ul className="mb-4 space-y-1 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-pink/30">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatBRL(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Seu nome</label>
          <input name="customerName" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Telefone / WhatsApp</label>
          <input name="customerPhone" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Entrega</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => changeDeliveryType("retirada")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                deliveryType === "retirada" ? "border-pink-deep bg-pink text-pink-deep" : "border-stone-300"
              }`}
            >
              Retirada
            </button>
            <button
              type="button"
              onClick={() => changeDeliveryType("entrega")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                deliveryType === "entrega" ? "border-pink-deep bg-pink text-pink-deep" : "border-stone-300"
              }`}
            >
              Entrega
            </button>
          </div>
          {deliveryType === "entrega" && (
            <p className="mt-1.5 text-xs text-stone-500">
              A taxa de entrega será calculada pela loja e informada junto com a confirmação do pedido.
            </p>
          )}
        </div>

        {deliveryType === "entrega" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Endereço completo</label>
            <input name="address" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Forma de pagamento</label>
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {paymentOptions.map((value) => (
              <option key={value} value={value}>
                {PAYMENT_METHOD_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Observações</label>
          <textarea name="notes" rows={2} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>

        {minOrder > 0 && (
          <p className="text-xs text-stone-400">Pedido mínimo: {formatBRL(minOrder)}</p>
        )}

        <div className="flex justify-between text-sm font-semibold text-stone-700">
          <span>{deliveryType === "entrega" ? "Subtotal" : "Total"}</span>
          <span>{formatBRL(subtotal)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-pink-deep px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Confirmar pedido 🍰"}
        </button>
      </form>
    </div>
  );
}
