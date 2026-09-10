import OrderTracker from "@/components/store/order-tracker";
import { getStoreSettings } from "@/lib/db/settings";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, settings] = await Promise.all([params, getStoreSettings()]);
  return <OrderTracker orderId={id} storeAddress={settings.address} />;
}
