import type { ReactNode } from "react";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import { listCategories } from "@/lib/db/categories";
import { CartProvider } from "@/lib/cart-context";
import StoreHeader from "@/components/store/header";
import CartDrawer from "@/components/store/cart-drawer";
import FloatingWhatsApp from "@/components/store/floating-whatsapp";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [settings, categories] = await Promise.all([getStoreSettings(), listCategories()]);
  const isOpen = isStoreOpenNow(settings);
  const activeCategories = categories.filter((c) => c.active);

  return (
    <CartProvider>
      <StoreHeader
        storeName={settings.name}
        logoUrl={settings.logoUrl}
        isOpen={isOpen}
        categories={activeCategories}
      />
      {children}
      <CartDrawer />
      <FloatingWhatsApp whatsapp={settings.whatsapp} />
    </CartProvider>
  );
}
