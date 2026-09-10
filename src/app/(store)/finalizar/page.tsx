import Link from "next/link";
import { getStoreSettings, isStoreOpenNow } from "@/lib/db/settings";
import CheckoutForm from "@/components/store/checkout-form";

export default async function FinalizarPage() {
  const settings = await getStoreSettings();
  const isOpen = isStoreOpenNow(settings);

  if (!isOpen) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🌙</p>
        <h1 className="mt-3 font-script text-3xl text-pink-deep">Estamos fechados</h1>
        <p className="mt-2 text-sm text-stone-500">
          No momento não estamos recebendo pedidos. Volte durante o horário de funcionamento!
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-pink-deep hover:underline">
          ← Voltar ao cardápio
        </Link>
      </div>
    );
  }

  return <CheckoutForm minOrder={settings.minOrder} />;
}
