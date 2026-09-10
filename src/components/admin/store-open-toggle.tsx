import { toggleStoreOpenAction } from "@/actions/settings";

export default function StoreOpenToggle({ manuallyClosed }: { manuallyClosed: boolean }) {
  return (
    <form action={toggleStoreOpenAction}>
      <input type="hidden" name="closed" value={(!manuallyClosed).toString()} />
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-medium ${
          manuallyClosed
            ? "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
            : "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
        }`}
      >
        {manuallyClosed ? "🔴 Loja fechada — abrir agora" : "🟢 Loja aberta — fechar agora"}
      </button>
    </form>
  );
}
