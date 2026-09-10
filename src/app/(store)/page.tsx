import { listAvailableProducts } from "@/lib/db/products";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import { WEEKDAYS } from "@/lib/types";
import ProductCard from "@/components/store/product-card";

export default async function CardapioPage() {
  const [products, settings] = await Promise.all([
    listAvailableProducts(),
    getStoreSettings(),
  ]);

  const isOpen = isStoreOpenNow(settings);
  const todayKey = WEEKDAYS[(new Date().getDay() + 6) % 7].key;
  const todayHours = settings.hours[todayKey];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <section className="mb-8 text-center">
        {settings.address && <p className="text-sm text-stone-500">📍 {settings.address}</p>}
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
      </section>

      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">
          Nenhum produto disponível no momento. Volte em breve! 💗
        </p>
      )}
    </main>
  );
}
