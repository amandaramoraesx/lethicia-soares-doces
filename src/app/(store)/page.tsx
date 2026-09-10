import { listAvailableProducts } from "@/lib/db/products";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import { WEEKDAYS } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import LiveMenu from "@/components/store/live-menu";

export default async function CardapioPage() {
  const [products, settings] = await Promise.all([
    listAvailableProducts(),
    getStoreSettings(),
  ]);

  const isOpen = isStoreOpenNow(settings);
  const todayKey = WEEKDAYS[(new Date().getDay() + 6) % 7].key;
  const todayHours = settings.hours[todayKey];

  const whatsappLink = settings.whatsapp
    ? waLink(settings.whatsapp, "Olá! Vim pelo cardápio digital 🍰")
    : null;
  const instagramLink = settings.instagram
    ? `https://instagram.com/${settings.instagram.replace(/^@/, "")}`
    : null;
  const mapsLink = settings.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <section className="mb-8 text-center">
        {mapsLink ? (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stone-500 hover:text-pink-deep hover:underline"
          >
            📍 {settings.address}
          </a>
        ) : (
          settings.address && <p className="text-sm text-stone-500">📍 {settings.address}</p>
        )}
        <p className="mt-1 text-sm text-stone-500">
          {todayHours.closed
            ? "Fechado hoje"
            : `Hoje: ${todayHours.open} às ${todayHours.close}`}
        </p>
        {!isOpen && (
          <p className="mt-3 inline-block rounded-full bg-cream-dark px-4 py-1.5 text-xs font-medium text-stone-500">
            Estamos fechados no momento — dá uma olhada no cardápio! 🌙
          </p>
        )}

        {(whatsappLink || instagramLink) && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#128C4A] hover:bg-[#25D366]/20"
              >
                💬 WhatsApp
              </a>
            )}
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-pink/40 px-3 py-1.5 text-xs font-medium text-pink-deep hover:bg-pink/60"
              >
                📷 @{settings.instagram.replace(/^@/, "")}
              </a>
            )}
          </div>
        )}
      </section>

      <LiveMenu initialProducts={products} />
    </main>
  );
}
