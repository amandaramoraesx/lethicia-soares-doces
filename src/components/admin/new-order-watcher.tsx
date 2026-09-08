"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 15000;

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
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.6);
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
      <span>🔔 Novo pedido recebido!</span>
      <button
        onClick={() => setAlertVisible(false)}
        className="rounded-md bg-pink-700 px-2 py-1 text-xs font-medium hover:bg-pink-800"
      >
        Ok
      </button>
    </div>
  );
}
