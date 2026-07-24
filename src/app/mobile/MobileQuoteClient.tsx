"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Check, MessageCircle, FileText } from "lucide-react";
import { createQuote, buildWhatsAppLink } from "@/actions/quotes";
import type { ClientOption } from "@/actions/clients";
import { BRL } from "@/lib/utils";

type Item = { key: string; name: string; quantity: number; unitPrice: number };

const novoItem = (): Item => ({
  key: Math.random().toString(36).slice(2),
  name: "",
  quantity: 1,
  unitPrice: 0,
});

const inputCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3.5 py-3 text-[15px] text-leather " +
  "outline-none transition-colors placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/30";

const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink/45";

interface Props {
  clients: ClientOption[];
  products: string[];
  vendedor: string;
}

export function MobileQuoteClient({ clients, products, vendedor }: Props) {
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([novoItem()]);

  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState<{ id: string } | null>(null);
  const [abrindoZap, setAbrindoZap] = useState(false);

  const total = useMemo(
    () => items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0),
    [items]
  );

  const podeSalvar = clientName.trim().length >= 2 && items.some((i) => i.name.trim());

  function escolherCliente(id: string) {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) {
      setClientName(c.name);
      setClientPhone(c.phone || "");
    }
  }

  function setItem(key: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await createQuote({
        clientName: clientName.trim(),
        clientId: clientId || undefined,
        clientPhone: clientPhone.trim(),
        clientEmail: "",
        notes: notes.trim(),
        items: items
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
          })),
      });
      if (!res.ok) return setErro(res.error);
      setSalvo({ id: res.data.id });
    });
  }

  async function enviarWhatsApp(id: string) {
    setAbrindoZap(true);
    const res = await buildWhatsAppLink(id);
    setAbrindoZap(false);
    if (!res.ok) return setErro(res.error);
    window.open(res.data.url, "_blank");
  }

  function novoOrcamento() {
    setClientId("");
    setClientName("");
    setClientPhone("");
    setNotes("");
    setItems([novoItem()]);
    setSalvo(null);
    setErro(null);
    window.scrollTo({ top: 0 });
  }

  /* ─── Tela de confirmação ─────────────────────────── */
  if (salvo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/15">
          <Check className="h-8 w-8 text-champagne" strokeWidth={2.5} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-leather">Orçamento salvo</h1>
        <p className="mt-1 text-sm text-ink/55">
          {clientName} — {BRL.format(total)}
        </p>

        <div className="mt-8 w-full max-w-sm space-y-3">
          <button
            onClick={() => enviarWhatsApp(salvo.id)}
            disabled={abrindoZap}
            className="btn-gold w-full disabled:opacity-60"
          >
            {abrindoZap ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Enviar no WhatsApp
          </button>
          <a
            href={`/admin/orcamentos/${salvo.id}`}
            className="btn-outline w-full"
          >
            <FileText className="h-4 w-4" /> Abrir no painel
          </a>
          <button onClick={novoOrcamento} className="w-full py-3 text-sm text-ink/50">
            Criar outro orçamento
          </button>
        </div>
        {erro && <p className="mt-5 text-sm text-burgundy">{erro}</p>}
      </div>
    );
  }

  /* ─── Formulário ──────────────────────────────────── */
  return (
    <div className="pb-44">
      {products.length > 0 && (
        <datalist id="mobile-product-options">
          {products.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      )}

      <header className="sticky top-0 z-20 border-b-2 border-champagne bg-white px-5 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <Image
            src="/owl-icon.png"
            alt="OWL PRINT"
            width={40}
            height={49}
            priority
            className="h-9 w-auto"
          />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold leading-tight tracking-wide text-leather">
              Novo orçamento
            </h1>
            <p className="truncate text-[11px] uppercase tracking-[0.25em] text-leather/45">
              {vendedor}
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-5 pt-6">
        {/* Cliente */}
        <section className="card p-4">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-leather">
            Cliente
          </h2>

          {clients.length > 0 && (
            <div className="mb-4">
              <label className={labelCls}>Buscar no CRM</label>
              <select
                value={clientId}
                onChange={(e) => escolherCliente(e.target.value)}
                className={inputCls}
              >
                <option value="">Cliente novo (digitar abaixo)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className={labelCls}>Estabelecimento</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex.: Spazio Sabor"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>WhatsApp</label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              inputMode="tel"
              placeholder="(11) 90000-0000"
              className={inputCls}
            />
          </div>
        </section>

        {/* Itens */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-leather">
              Itens
            </h2>
            <button
              onClick={() => setItems((p) => [...p, novoItem()])}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-champagne"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>

          {items.map((i, idx) => (
            <article key={i.key} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => setItems((p) => p.filter((x) => x.key !== i.key))}
                    aria-label="Remover item"
                    className="p-1 text-ink/35 hover:text-burgundy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className={labelCls}>Produto</label>
                <input
                  list="mobile-product-options"
                  value={i.name}
                  onChange={(e) => setItem(i.key, { name: e.target.value })}
                  placeholder="Capa de cardápio"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Quantidade</label>
                  <input
                    value={i.quantity}
                    onChange={(e) =>
                      setItem(i.key, { quantity: Number(e.target.value.replace(/\D/g, "")) || 0 })
                    }
                    inputMode="numeric"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Valor unitário</label>
                  <input
                    value={i.unitPrice}
                    onChange={(e) =>
                      setItem(i.key, {
                        unitPrice: Number(e.target.value.replace(",", ".")) || 0,
                      })
                    }
                    inputMode="decimal"
                    className={inputCls}
                  />
                </div>
              </div>

              <p className="mt-3 text-right text-sm text-ink/50">
                Subtotal{" "}
                <span className="font-semibold text-leather">
                  {BRL.format((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0))}
                </span>
              </p>
            </article>
          ))}
        </section>

        {/* Observações */}
        <section className="card p-4">
          <label className={labelCls}>Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Logo em hot stamping dourado, prazo de 10 dias úteis…"
            className={inputCls}
          />
        </section>

        {erro && (
          <p className="rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
            {erro}
          </p>
        )}
      </main>

      {/* Rodapé fixo */}
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-leather/10 bg-white px-5 pb-6 pt-4 shadow-[0_-8px_24px_rgba(17,24,39,0.06)]">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
            Total do orçamento
          </span>
          <span className="font-display text-2xl font-bold tabular-nums text-leather">
            {BRL.format(total)}
          </span>
        </div>
        <button
          onClick={salvar}
          disabled={!podeSalvar || pending}
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pending ? "Salvando…" : "Salvar orçamento"}
        </button>
      </footer>
    </div>
  );
}
