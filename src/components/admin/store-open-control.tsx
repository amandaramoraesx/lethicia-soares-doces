import { toggleStoreOpenAction } from "@/actions/settings";
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

export default function StoreOpenControl({ settings }: { settings: StoreSettings }) {
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
    <form action={toggleStoreOpenAction}>
      <input type="hidden" name="closed" value={(!settings.manuallyClosed).toString()} />
      <button
        type="submit"
        className={`rounded-lg px-3 py-2 text-left text-xs font-medium leading-tight ${
          open
            ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
            : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
        }`}
      >
        <span className="block">
          {open ? "🟢 Aberta agora" : "🔴 Fechada agora"} · {reason}
        </span>
        <span className="block opacity-70">
          {settings.manuallyClosed ? "toque para reabrir" : "toque para fechar manualmente"}
        </span>
      </button>
    </form>
  );
}
