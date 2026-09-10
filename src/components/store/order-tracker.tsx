"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { getOrderStatusLabel, type Order, type OrderStatus } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STEPS: OrderStatus[] = ["recebido", "preparo", "saiu_entrega", "entregue"];

export default function OrderTracker({
  orderId,
  storeAddress,
}: {
  orderId: string;
  storeAddress: string;
}) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    const ref = doc(getClientDb(), "orders", orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setOrder(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null);
      },
      () => setOrder(null)
    );
    return () => unsub();
  }, [orderId]);

  if (order === undefined) {
    return <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-stone-400">Carregando pedido...</div>;
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-stone-500">Pedido não encontrado.</p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-pink-deep px-5 py-2 text-sm font-semibold text-white">
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-4xl">
          {order.status === "aguardando" ? "⏳" : order.status === "cancelado" ? "😔" : "🎉"}
        </p>
        <h1 className="mt-3 font-script text-3xl text-pink-deep">
          {order.status === "aguardando" && "Aguardando confirmação da loja..."}
          {order.status === "cancelado" && "Pedido não pôde ser aceito"}
          {order.status !== "aguardando" && order.status !== "cancelado" && "Pedido confirmado!"}
        </h1>
        <p className="mt-1 text-xs text-stone-400">Pedido #{order.id.slice(0, 6)}</p>
      </div>

      {order.status === "aguardando" && (
        <p className="mb-6 rounded-xl bg-white p-4 text-center text-sm text-stone-500 shadow-sm ring-1 ring-pink/30">
          A loja vai confirmar seu pedido em instantes. Essa página atualiza sozinha, pode deixar aberta 💗
        </p>
      )}

      {order.status === "cancelado" && (
        <p className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600 ring-1 ring-red-100">
          {order.rejectionReason || "A loja não conseguiu aceitar esse pedido dessa vez."}
        </p>
      )}

      {order.status !== "aguardando" && order.status !== "cancelado" && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const currentIndex = STEPS.indexOf(order.status);
              const reached = i <= currentIndex;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      reached ? "bg-pink-deep text-white" : "bg-stone-200 text-stone-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className={`mt-1 text-center text-[10px] ${reached ? "text-pink-deep" : "text-stone-400"}`}>
                    {getOrderStatusLabel(step, order.deliveryType)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.status !== "aguardando" && order.status !== "cancelado" && order.deliveryType === "entrega" && (
        <p className="mb-6 rounded-xl bg-white p-4 text-center text-sm text-stone-600 shadow-sm ring-1 ring-pink/30">
          📲 Aguarde! Vamos te enviar por aqui no WhatsApp o código de acompanhamento e os dados da
          sua entrega.
        </p>
      )}

      {order.status !== "aguardando" && order.status !== "cancelado" && order.deliveryType === "retirada" && storeAddress && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 block rounded-xl bg-white p-4 text-center text-sm text-stone-600 shadow-sm ring-1 ring-pink/30 transition hover:ring-pink-deep/50"
        >
          📍 Retire em: <span className="font-medium text-pink-deep underline">{storeAddress}</span>
        </a>
      )}

      <div className="rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-pink/30">
        <ul className="mb-3 space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between text-stone-600">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatBRL(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-stone-500">
          <span>Subtotal</span>
          <span>{formatBRL(order.subtotal)}</span>
        </div>
        {order.deliveryType === "entrega" && (
          <div className="flex justify-between text-stone-500">
            <span>Taxa de entrega</span>
            <span>{order.deliveryFeePending ? "a calcular" : formatBRL(order.deliveryFee)}</span>
          </div>
        )}
        {!order.deliveryFeePending && (
          <div className="mt-2 flex justify-between border-t border-stone-100 pt-2 font-semibold text-stone-800">
            <span>Total</span>
            <span>{formatBRL(order.total)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm font-medium text-pink-deep hover:underline">
          Voltar ao cardápio
        </Link>
      </div>
    </div>
  );
}
