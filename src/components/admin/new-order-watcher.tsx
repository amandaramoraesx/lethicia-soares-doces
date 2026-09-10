"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 5000;

export default function NewOrderWatcher() {
  const router = useRouter();
  const [alertVisible, setAlertVisible] = useState(false);
  const lastSeenId = useRef<string | null>(null);
  const isFirstCheck = useRef(true);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      function beep(frequency: number, startTime: number) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.35);
      }

      beep(880, ctx.currentTime);
      beep(1100, ctx.currentTime + 0.18);
    } catch {
      // navegador pode bloquear áudio sem interação prévia
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/orders/latest", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (isFirstCheck.current) {
          lastSeenId.current = data.latestId;
          isFirstCheck.current = false;
          return;
        }

        if (data.latestId && data.latestId !== lastSeenId.current) {
          lastSeenId.current = data.latestId;
          setAlertVisible(true);
          playNotificationSound();
          router.refresh();
        }
      } catch {
        // silencioso: próxima tentativa em breve
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router, playNotificationSound]);

  if (!alertVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-pink-600 px-4 py-3 text-sm text-white shadow-lg">
      <span>🔔 Novo pedido! Aceitar ou recusar?</span>
      <button
        onClick={() => {
          setAlertVisible(false);
          router.push("/admin/pedidos");
        }}
        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-50"
      >
        Ver pedido
      </button>
      <button
        onClick={() => setAlertVisible(false)}
        aria-label="Fechar aviso"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
