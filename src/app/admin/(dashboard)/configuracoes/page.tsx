import { getStoreSettings } from "@/lib/db/settings";
import { saveSettingsAction } from "@/actions/settings";
import { WEEKDAYS } from "@/lib/types";
import StoreOpenControl from "@/components/admin/store-open-control";
import ResetTestDataForm from "@/components/admin/reset-test-data-form";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; reset?: string; resetError?: string }>;
}) {
  const [settings, { saved, reset, resetError }] = await Promise.all([getStoreSettings(), searchParams]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-800">Configurações da loja</h1>
        <StoreOpenControl settings={settings} />
      </div>

      {saved === "1" && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          ✓ Configurações salvas com sucesso!
        </p>
      )}

      {reset === "1" && (
        <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          ✓ Dados de teste apagados com sucesso!
        </p>
      )}

      {resetError === "1" && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          ✕ Palavra de confirmação incorreta. Nada foi apagado.
        </p>
      )}

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
              <label className="mb-1 block text-xs font-medium text-stone-600">Instagram (usuário, sem @)</label>
              <input
                name="instagram"
                defaultValue={settings.instagram}
                placeholder="lethiciasoaresdoces"
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
              <label className="mb-1 block text-xs font-medium text-stone-600">Taxa de entrega padrão (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="deliveryFee"
                defaultValue={settings.deliveryFee}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-stone-400">
                Valor sugerido ao aceitar um pedido com entrega — você pode ajustar em cada pedido.
              </p>
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

      <div className="mt-8 max-w-2xl rounded-xl bg-white p-5 shadow-sm ring-1 ring-red-200">
        <h2 className="mb-2 text-sm font-semibold text-red-700">⚠️ Zona de risco</h2>
        <p className="mb-1 text-xs text-stone-500">
          Apaga permanentemente <strong>Pedidos</strong>, <strong>Encomendas</strong> e todo o{" "}
          <strong>Financeiro</strong> (lançamentos, contas a pagar, contas a receber e fiado). Use
          isso para limpar pedidos e valores de teste antes de começar a usar de verdade.
        </p>
        <p className="mb-4 text-xs text-stone-500">
          Não é apagado: <strong>Doces</strong>, <strong>Catálogo de encomendas</strong>,{" "}
          <strong>Estoque</strong>, <strong>Clientes cadastrados</strong> (só o saldo de fiado é
          zerado) e as <strong>Configurações</strong> da loja.
        </p>
        <ResetTestDataForm />
      </div>
    </div>
  );
}
