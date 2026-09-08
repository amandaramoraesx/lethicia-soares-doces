import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import type { StoreSettings } from "@/lib/types";

const settingsDoc = () => adminDb.collection("config").doc("store");

const DEFAULT_SETTINGS: StoreSettings = {
  name: "Lethícia Soares Doces",
  logoUrl: "",
  whatsapp: "",
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
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await settingsDoc().get();
  if (!snap.exists) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
}

export async function updateStoreSettings(data: StoreSettings): Promise<void> {
  await settingsDoc().set(data, { merge: true });
}

export function isStoreOpenNow(settings: StoreSettings): boolean {
  const now = new Date();
  const dayKeys: Array<keyof StoreSettings["hours"]> = [
    "dom",
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
    "sab",
  ];
  const today = settings.hours[dayKeys[now.getDay()]];
  if (!today || today.closed) return false;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const minutesOpen = openH * 60 + openM;
  const minutesClose = closeH * 60 + closeM;
  return minutesNow >= minutesOpen && minutesNow < minutesClose;
}
