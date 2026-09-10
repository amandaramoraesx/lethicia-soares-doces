import { isStoreOpenNow, getBrazilNow } from "@/lib/db/settings";
import { WEEKDAYS, type StoreSettings } from "@/lib/types";

const DAY_KEYS_BY_JS_INDEX: Array<keyof StoreSettings["hours"]> = [
  "dom",
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
];

export default function StoreStatusBadge({ settings }: { settings: StoreSettings }) {
  const open = isStoreOpenNow(settings);
  const todayKey = DAY_KEYS_BY_JS_INDEX[getBrazilNow().dayOfWeek];
  const today = settings.hours[todayKey];
  const dayLabel = WEEKDAYS.find((w) => w.key === todayKey)?.label ?? "";

  let reason: string;
  if (open) {
    reason = `dentro do horário de hoje (${today.open}–${today.close})`;
  } else if (settings.manuallyClosed) {
    reason = "fechada manualmente";
  } else if (today.closed) {
    reason = `sem funcionamento às ${dayLabel.toLowerCase()}s`;
  } else {
    reason = `fora do horário de hoje (${today.open}–${today.close})`;
  }

  return (
    <p
      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
        open ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {open ? "🟢 Aberta agora" : "🔴 Fechada agora"} · {reason}
    </p>
  );
}
