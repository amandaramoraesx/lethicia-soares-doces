import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import { CartProvider } from "@/lib/cart-context";
import StoreHeader from "@/components/store/header";
import CartDrawer from "@/components/store/cart-drawer";
import FloatingWhatsApp from "@/components/store/floating-whatsapp";

export const dynamic = "force-dynamic";

// O manifest (que faz "Adicionar à Tela de Início" mostrar a logo como
// ícone de app) fica restrito só ao cardápio público — se ficasse no
// layout raiz, o Safari usaria o start_url do manifest para QUALQUER
// atalho salvo no domínio, inclusive o do /admin/login, sempre abrindo
// o cardápio em vez da página que a lojista realmente salvou.
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lethícia Doces",
  },
};

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  const isOpen = isStoreOpenNow(settings);

  return (
    <CartProvider>
      <StoreHeader
        storeName={settings.name}
        logoUrl={settings.logoUrl}
        isOpen={isOpen}
      />
      {children}
      <CartDrawer />
      <FloatingWhatsApp whatsapp={settings.whatsapp} />
    </CartProvider>
  );
}
