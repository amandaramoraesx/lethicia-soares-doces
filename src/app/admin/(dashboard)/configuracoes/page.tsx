import { getStoreSettings } from "@/lib/db/settings";
import { saveSettingsAction } from "@/actions/settings";
import { WEEKDAYS } from "@/lib/types";

export default async function ConfiguracoesPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-800">Configurações da loja</h1>

      <form action={saveSettingsAction} className="max-w-2xl space-y-6">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">Dados gerais</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Nome da loja</label>
              <input
                name="name"
                required
                defaultValue={settings.name}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">URL do logo</label>
              <input
                name="logoUrl"
                defaultValue={settings.logoUrl}
                placeholder="https://..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                WhatsApp (com DDD, só números)
              </label>
              <input
                name="whatsapp"
                defaultValue={settings.whatsapp}
                placeholder="5511999999999"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Endereço</label>
              <input
                name="address"
                defaultValue={settings.address}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Taxa de entrega (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="deliveryFee"
                defaultValue={settings.deliveryFee}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Pedido mínimo (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="minOrder"
                defaultValue={settings.minOrder}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Chave Pix (opcional)</label>
              <input
                name="pixKey"
                defaultValue={settings.pixKey}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">Horário de funcionamento</h2>
          <div className="space-y-2">
            {WEEKDAYS.map(({ key, label }) => {
              const day = settings.hours[key];
              return (
                <div key={key} className="flex flex-wrap items-center gap-3">
                  <label className="flex w-32 items-center gap-2 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      name={`active_${key}`}
                      defaultChecked={!day.closed}
                      className="h-4 w-4"
                    />
                    {label}
                  </label>
                  <input
                    type="time"
                    name={`open_${key}`}
                    defaultValue={day.open}
                    className="rounded-lg border border-stone-300 px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-stone-400">até</span>
                  <input
                    type="time"
                    name={`close_${key}`}
                    defaultValue={day.close}
                    className="rounded-lg border border-stone-300 px-2 py-1 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
        >
          Salvar configurações
        </button>
      </form>
    </div>
  );
}
