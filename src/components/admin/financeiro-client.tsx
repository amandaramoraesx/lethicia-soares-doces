"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Colapsavel from "@/components/admin/collapsible";
import {
  createFinancialEntryAction,
  deleteFinancialEntryAction,
  createPayableAction,
  markPayablePaidAction,
  deletePayableAction,
} from "@/actions/financial";
import { registerFiadoPaymentAction } from "@/actions/customers";
import { DESPESA_CATEGORIAS } from "@/lib/finance-constants";
import { PAYMENT_METHOD_LABELS, type AccountPayable, type AccountReceivable, type FinancialEntry, type PaymentMethod } from "@/lib/types";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type Aba = "hoje" | "clientes" | "resumo";
type Modal = "despesa" | "receita" | "pagar" | null;

export default function FinanceiroClient({
  entries,
  payables,
  receivables,
}: {
  entries: FinancialEntry[];
  payables: AccountPayable[];
  receivables: AccountReceivable[];
}) {
  const [aba, setAba] = useState<Aba>("hoje");
  const [modal, setModal] = useState<Modal>(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-800">Financeiro 💰</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModal("pagar")}
            className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200"
          >
            + Conta a pagar
          </button>
          <button
            onClick={() => setModal("despesa")}
            className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200"
          >
            + Despesa
          </button>
          <button
            onClick={() => setModal("receita")}
            className="rounded-lg bg-pink-500 px-3 py-2 text-xs font-medium text-white hover:bg-pink-600"
          >
            + Receita
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-stone-200">
        {(["hoje", "clientes", "resumo"] as Aba[]).map((t) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              aba === t ? "border-pink-deep text-pink-deep" : "border-transparent text-stone-500 hover:text-pink-deep"
            }`}
          >
            {t === "hoje" ? "Por dia" : t === "clientes" ? "Clientes em aberto" : "Resumo geral"}
          </button>
        ))}
      </div>

      {aba === "hoje" && <VisaoHoje entries={entries} payables={payables} />}
      {aba === "clientes" && <VisaoClientesEmAberto receivables={receivables} />}
      {aba === "resumo" && <ResumoGeral entries={entries} />}

      {modal === "despesa" && <DespesaModal onClose={() => setModal(null)} />}
      {modal === "receita" && <ReceitaModal onClose={() => setModal(null)} />}
      {modal === "pagar" && <PagarModal onClose={() => setModal(null)} />}
    </div>
  );
}

function VisaoHoje({ entries, payables }: { entries: FinancialEntry[]; payables: AccountPayable[] }) {
  const hoje = todayISO();
  const [selectedDate, setSelectedDate] = useState(hoje);

  function mudarDia(delta: number) {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + delta);
    setSelectedDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const entradasDia = entries.filter((e) => e.type === "entrada" && e.date.slice(0, 10) === selectedDate);
  const despesasDia = entries.filter((e) => e.type === "saida" && e.date.slice(0, 10) === selectedDate);
  const openPayables = payables.filter((p) => p.status === "aberta");
  const diaLabel = selectedDate === hoje ? "hoje" : formatDate(selectedDate);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => mudarDia(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
        >
          ‹
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
        />
        <button
          onClick={() => mudarDia(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
        >
          ›
        </button>
        {selectedDate !== hoje && (
          <button
            onClick={() => setSelectedDate(hoje)}
            className="whitespace-nowrap rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-pink-deep hover:bg-pink-50"
          >
            Hoje
          </button>
        )}
      </div>

      <Colapsavel titulo={`Entradas de ${diaLabel}`} resumo={formatBRL(entradasDia.reduce((s, e) => s + e.amount, 0))}>
        <EntryList entries={entradasDia} vazio="Nenhuma entrada nesse dia." />
      </Colapsavel>

      <Colapsavel titulo={`Despesas de ${diaLabel}`} resumo={formatBRL(despesasDia.reduce((s, e) => s + e.amount, 0))}>
        <EntryList entries={despesasDia} vazio="Nenhuma despesa nesse dia." />
      </Colapsavel>

      <Colapsavel
        titulo="Contas a pagar em aberto"
        resumo={formatBRL(openPayables.reduce((s, p) => s + p.amount, 0))}
        defaultAberto={false}
      >
        <div className="space-y-2">
          {openPayables.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate text-stone-700">{p.description}</p>
                <p className="text-xs text-stone-400">Vence {formatDate(p.dueDate)} · {p.categoryName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-medium text-stone-800">{formatBRL(p.amount)}</span>
                <form action={markPayablePaidAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs font-medium text-green-600 hover:text-green-700">paga</button>
                </form>
                <form action={deletePayableAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-red-500 hover:text-red-700">excluir</button>
                </form>
              </div>
            </div>
          ))}
          {openPayables.length === 0 && <p className="text-sm text-stone-400">Nenhuma conta em aberto.</p>}
        </div>
      </Colapsavel>
    </div>
  );
}

function EntryList({ entries, vazio }: { entries: FinancialEntry[]; vazio: string }) {
  return (
    <div className="space-y-1.5">
      {entries.map((e) => (
        <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 truncate text-stone-600">
            {e.categoryName}
            {e.description ? ` · ${e.description}` : ""}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className={`font-medium ${e.type === "entrada" ? "text-green-600" : "text-red-500"}`}>
              {e.type === "entrada" ? "+" : "-"}
              {formatBRL(e.amount)}
            </span>
            <form action={deleteFinancialEntryAction}>
              <input type="hidden" name="id" value={e.id} />
              <button type="submit" className="text-xs text-stone-400 hover:text-red-600">✕</button>
            </form>
          </span>
        </div>
      ))}
      {entries.length === 0 && <p className="text-sm text-stone-400">{vazio}</p>}
    </div>
  );
}

function VisaoClientesEmAberto({ receivables }: { receivables: AccountReceivable[] }) {
  const abertas = receivables.filter((r) => r.status === "aberta");
  const quitadas = receivables.filter((r) => r.status === "quitada");
  const totalAberto = abertas.reduce((s, r) => s + (r.originalAmount - r.paidAmount), 0);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs font-medium text-stone-500">Total em aberto</p>
        <p className="text-xl font-semibold text-amber-600">{formatBRL(totalAberto)}</p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">Em aberto</h3>
        <div className="space-y-3">
          {abertas.map((r) => (
            <ReceivableRow key={r.id} r={r} />
          ))}
          {abertas.length === 0 && <p className="text-sm text-stone-400">Nenhum cliente em aberto.</p>}
        </div>
      </div>

      {quitadas.length > 0 && (
        <Colapsavel titulo="Quitados" resumo={`${quitadas.length}`} defaultAberto={false}>
          <div className="space-y-2">
            {quitadas.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/clientes/${r.customerId}`} className="text-pink-700 hover:underline">
                  {r.customerName}
                </Link>
                <span className="text-stone-500">{formatBRL(r.originalAmount)}</span>
              </div>
            ))}
          </div>
        </Colapsavel>
      )}
    </div>
  );
}

function ReceivableRow({ r }: { r: AccountReceivable }) {
  const restante = r.originalAmount - r.paidAmount;
  const [amount, setAmount] = useState(String(restante));

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("customerId", r.customerId);
    fd.set("amount", amount);
    await registerFiadoPaymentAction(fd);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 first:border-0 first:pt-0">
      <div className="min-w-0">
        <Link href={`/admin/clientes/${r.customerId}`} className="text-sm font-medium text-pink-700 hover:underline">
          {r.customerName}
        </Link>
        <p className="text-xs text-stone-400">Desde {formatDate(r.createdAt)} · deve {formatBRL(restante)}</p>
      </div>
      <form onSubmit={pagar} className="flex items-center gap-1.5">
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={restante}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-xs"
        />
        <button type="submit" className="rounded-lg bg-pink-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-pink-600">
          Registrar pagamento
        </button>
      </form>
    </div>
  );
}

function ResumoGeral({ entries }: { entries: FinancialEntry[] }) {
  const [mesRef, setMesRef] = useState(() => todayISO().slice(0, 7));

  function mudarMes(delta: number) {
    const [ano, mes] = mesRef.split("-").map(Number);
    const d = new Date(ano, mes - 1 + delta, 1);
    setMesRef(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const entriesMes = entries.filter((e) => e.date.startsWith(mesRef));
  const totalRecebido = entriesMes.filter((e) => e.type === "entrada").reduce((s, e) => s + e.amount, 0);
  const totalDespesas = entriesMes.filter((e) => e.type === "saida").reduce((s, e) => s + e.amount, 0);
  const lucro = totalRecebido - totalDespesas;

  const porForma = useMemo(() => {
    const map = new Map<PaymentMethod, number>();
    for (const e of entriesMes) {
      if (e.type !== "entrada" || !e.paymentMethod) continue;
      map.set(e.paymentMethod, (map.get(e.paymentMethod) ?? 0) + e.amount);
    }
    return map;
  }, [entriesMes]);

  const nomeMes = new Date(mesRef + "-01T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <button onClick={() => mudarMes(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50">
          ‹
        </button>
        <span className="w-40 text-center text-sm font-medium capitalize text-stone-700">{nomeMes}</span>
        <button onClick={() => mudarMes(1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50">
          ›
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatBox label="Total recebido" value={formatBRL(totalRecebido)} />
        <StatBox label="Despesas" value={formatBRL(totalDespesas)} />
        <StatBox label="Lucro" value={formatBRL(lucro)} destaque />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">Recebido por forma de pagamento</h3>
        <div className="space-y-2">
          {Array.from(porForma.entries()).map(([method, amount]) => (
            <div key={method} className="flex justify-between text-sm">
              <span className="text-stone-500">{PAYMENT_METHOD_LABELS[method]}</span>
              <span className="font-medium text-stone-800">{formatBRL(amount)}</span>
            </div>
          ))}
          {porForma.size === 0 && <p className="text-sm text-stone-400">Nenhum recebimento neste mês.</p>}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, destaque }: { label: string; value: string; destaque?: boolean }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className={`text-xl font-semibold ${destaque ? "text-pink-deep" : "text-stone-800"}`}>{value}</p>
    </div>
  );
}

function ModalShell({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">{titulo}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm";

function DespesaModal({ onClose }: { onClose: () => void }) {
  const [categoria, setCategoria] = useState(DESPESA_CATEGORIAS[0]);
  const [outro, setOutro] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(todayISO());
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const category = categoria === "Outro" ? outro.trim() : categoria;
    if (!category) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("type", "saida");
    fd.set("category", category);
    fd.set("amount", valor);
    fd.set("date", data);
    await createFinancialEntryAction(fd);
    onClose();
  }

  return (
    <ModalShell titulo="Lançar despesa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Despesa">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
            {DESPESA_CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Outro">Outro (digitar)</option>
          </select>
        </Field>
        {categoria === "Outro" && (
          <Field label="Descreva a despesa">
            <input value={outro} onChange={(e) => setOutro(e.target.value)} className={inputCls} required />
          </Field>
        )}
        <Field label="Valor">
          <input type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Data">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputCls} required />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-stone-500 hover:bg-stone-50">Cancelar</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-60">
            Salvar despesa
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ReceitaModal({ onClose }: { onClose: () => void }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("dinheiro");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("type", "entrada");
    fd.set("category", "Receita avulsa");
    fd.set("description", descricao);
    fd.set("amount", valor);
    fd.set("date", data);
    fd.set("paymentMethod", paymentMethod);
    await createFinancialEntryAction(fd);
    onClose();
  }

  return (
    <ModalShell titulo="Lançar receita" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Descrição">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Valor">
          <input type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Data">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Forma de pagamento">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={inputCls}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-stone-500 hover:bg-stone-50">Cancelar</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-60">
            Salvar receita
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function PagarModal({ onClose }: { onClose: () => void }) {
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(DESPESA_CATEGORIAS[0]);
  const [outro, setOutro] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState(todayISO());
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const category = categoria === "Outro" ? outro.trim() : categoria;
    if (!category) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("description", descricao);
    fd.set("category", category);
    fd.set("amount", valor);
    fd.set("dueDate", vencimento);
    await createPayableAction(fd);
    onClose();
  }

  return (
    <ModalShell titulo="Nova conta a pagar" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Descrição">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Categoria">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
            {DESPESA_CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Outro">Outro (digitar)</option>
          </select>
        </Field>
        {categoria === "Outro" && (
          <Field label="Nome da categoria">
            <input value={outro} onChange={(e) => setOutro(e.target.value)} className={inputCls} required />
          </Field>
        )}
        <Field label="Valor">
          <input type="number" min="0.01" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Vencimento">
          <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className={inputCls} required />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-stone-500 hover:bg-stone-50">Cancelar</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-60">
            Adicionar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
