import { listAvailableProducts } from "@/lib/db/products";
import { listActiveOrderCatalogItems } from "@/lib/db/order-catalog";
import { getStoreSettings, isStoreOpenNow, getBrazilNow } from "@/lib/db/settings";
import { WEEKDAYS } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import MenuTabs from "@/components/store/menu-tabs";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.2c-1.6 0-3.13-.43-4.47-1.24l-.32-.19-3.12.82.83-3.04-.21-.32a8.16 8.16 0 0 1-1.26-4.35c0-4.53 3.68-8.2 8.55-8.2 4.53 0 8.2 3.67 8.2 8.2s-3.67 8.32-8.2 8.32Zm4.51-6.08c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.12-.56.12-.17.25-.65.8-.8.96-.15.17-.29.19-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.02 2.58c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4.6.24 1.03.52 1.48.97.45.45.73.88.97 1.48.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43-.24.6-.52 1.03-.97 1.48-.45.45-.88.73-1.48.97-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a3.99 3.99 0 0 1-1.48-.97 3.99 3.99 0 0 1-.97-1.48c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43.24-.6.52-1.03.97-1.48.45-.45.88-.73 1.48-.97.46-.16 1.26-.35 2.43-.4C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5.01-4.73.07-.96.04-1.48.2-1.83.34-.46.18-.79.39-1.13.74-.35.34-.56.67-.74 1.13-.14.35-.3.87-.34 1.83-.06 1.23-.07 1.6-.07 4.73s.01 3.5.07 4.73c.04.96.2 1.48.34 1.83.18.46.39.79.74 1.13.34.35.67.56 1.13.74.35.14.87.3 1.83.34 1.23.06 1.6.07 4.73.07s3.5-.01 4.73-.07c.96-.04 1.48-.2 1.83-.34.46-.18.79-.39 1.13-.74.35-.34.56-.67.74-1.13.14-.35.3-.87.34-1.83.06-1.23.07-1.6.07-4.73s-.01-3.5-.07-4.73c-.04-.96-.2-1.48-.34-1.83a2.98 2.98 0 0 0-.74-1.13 2.98 2.98 0 0 0-1.13-.74c-.35-.14-.87-.3-1.83-.34-1.23-.06-1.6-.07-4.73-.07Zm0 3.7a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6Zm0 1.8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm4.48-1.98a1.01 1.01 0 1 1 0 2.02 1.01 1.01 0 0 1 0-2.02Z" />
    </svg>
  );
}

export default async function CardapioPage() {
  const [products, catalogItems, settings] = await Promise.all([
    listAvailableProducts(),
    listActiveOrderCatalogItems(),
    getStoreSettings(),
  ]);

  const isOpen = isStoreOpenNow(settings);
  const todayKey = WEEKDAYS[(getBrazilNow().dayOfWeek + 6) % 7].key;
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
                <WhatsAppIcon /> WhatsApp
              </a>
            )}
            {instagramLink && (
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-pink/40 px-3 py-1.5 text-xs font-medium text-pink-deep hover:bg-pink/60"
              >
                <InstagramIcon /> @{settings.instagram.replace(/^@/, "")}
              </a>
            )}
          </div>
        )}
      </section>

      <MenuTabs products={products} catalogItems={catalogItems} whatsapp={settings.whatsapp} />
    </main>
  );
}
