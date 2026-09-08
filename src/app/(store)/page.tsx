import { listCategories } from "@/lib/db/categories";
import { listAvailableProducts } from "@/lib/db/products";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import { WEEKDAYS } from "@/lib/types";
import { categoryEmoji } from "@/lib/category-emoji";
import ProductCard from "@/components/store/product-card";

export default async function CardapioPage() {
  const [categories, products, settings] = await Promise.all([
    listCategories(),
    listAvailableProducts(),
    getStoreSettings(),
  ]);

  const isOpen = isStoreOpenNow(settings);
  const activeCategories = categories.filter((c) => c.active);
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

      {activeCategories.map((category) => {
        const categoryProducts = products.filter((p) => p.categoryId === category.id);
        if (categoryProducts.length === 0) return null;
        return (
          <section key={category.id} id={`categoria-${category.id}`} className="mb-8 scroll-mt-24">
            <h2 className="mb-3 text-lg font-semibold text-pink-deep">
              {categoryEmoji(category.name)} {category.name}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      {products.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">
          Nenhum produto disponível no momento. Volte em breve! 💗
        </p>
      )}
    </main>
  );
}
