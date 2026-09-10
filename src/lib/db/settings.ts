import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { StoreSettings } from "@/lib/types";

const settingsDoc = () => adminDb.collection("config").doc("store");

const DEFAULT_SETTINGS: StoreSettings = {
  name: "Lethícia Soares Doces",
  logoUrl: "/logo.png",
  whatsapp: "",
  instagram: "",
  address: "",
  deliveryFee: 0,
  minOrder: 0,
  pixKey: "",
  hours: {
    seg: { closed: false, open: "09:00", close: "18:00" },
    ter: { closed: false, open: "09:00", close: "18:00" },
    qua: { closed: false, open: "09:00", close: "18:00" },
    qui: { closed: false, open: "09:00", close: "18:00" },
    sex: { closed: false, open: "09:00", close: "18:00" },
    sab: { closed: false, open: "09:00", close: "13:00" },
    dom: { closed: true, open: "09:00", close: "13:00" },
  },
  manuallyClosed: false,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await settingsDoc().get();
  if (!snap.exists) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
}

export async function updateStoreSettings(data: StoreSettings): Promise<void> {
  await settingsDoc().set(data, { merge: true });
}

export async function setManuallyClosed(closed: boolean): Promise<void> {
  await settingsDoc().set({ manuallyClosed: closed }, { merge: true });
}

const WEEKDAY_ABBR_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// O servidor (Vercel) roda em UTC, mas os horários de funcionamento são
// pensados no horário de Brasília — calcular com `new Date().getHours()`
// direto usaria a hora UTC e deixaria a loja "fechada" nas horas erradas.
export function getBrazilNow(): { dayOfWeek: number; hours: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    dayOfWeek: WEEKDAY_ABBR_TO_INDEX[get("weekday")] ?? 0,
    hours: Number(get("hour")),
    minutes: Number(get("minute")),
  };
}

// Início do dia de hoje (00:00 em Brasília), como instante UTC — usado pra
// filtrar "pedidos de hoje" sem cair no mesmo problema de fuso horário.
export function startOfTodayBrazilISO(): string {
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${todayDate}T00:00:00-03:00`).toISOString();
}

export function isStoreOpenNow(settings: StoreSettings): boolean {
  if (settings.manuallyClosed) return false;

  const dayKeys: Array<keyof StoreSettings["hours"]> = [
    "dom",
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
    "sab",
  ];
  const { dayOfWeek, hours, minutes } = getBrazilNow();
  const today = settings.hours[dayKeys[dayOfWeek]];
  if (!today || today.closed) return false;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const minutesNow = hours * 60 + minutes;
  const minutesOpen = openH * 60 + openM;
  const minutesClose = closeH * 60 + closeM;
  return minutesNow >= minutesOpen && minutesNow < minutesClose;
}
