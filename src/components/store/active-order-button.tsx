"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";
import { getLastOrderId, clearLastOrderId } from "@/lib/order-tracking";
import type { Order, OrderStatus } from "@/lib/types";

export default function ActiveOrderButton() {
  const pathname = usePathname();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    // Leitura única do id salvo ao montar no cliente: localStorage não existe
    // durante o SSR, então isso precisa acontecer após a hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrderId(getLastOrderId());
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const ref = doc(getClientDb(), "orders", orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          clearLastOrderId();
          setOrderId(null);
          return;
        }
        const data = snap.data() as Order;
        if (data.status === "entregue" || data.status === "cancelado") {
          clearLastOrderId();
          setOrderId(null);
          return;
        }
        setStatus(data.status);
      },
      () => setStatus(null)
    );
    return () => unsub();
  }, [orderId]);

  if (!orderId || !status || pathname === `/pedido/${orderId}`) return null;

  return (
    <Link
      href={`/pedido/${orderId}`}
      className="fixed bottom-5 left-5 z-30 flex items-center gap-2 rounded-full bg-pink-deep px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
    >
      🎂 Acompanhar pedido
    </Link>
  );
}
