"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Send, Trash2 } from "lucide-react";

type Item = {
  id: string; name: string; category: string; image: string | null;
  sizes: string[]; colors: string[]; finishes: string[]; leathers: string[];
};

/* Cada linha do carrinho tem opções independentes — mesmo produto pode ter múltiplas linhas */
type CartLine = {
  itemId: string; qty: number; size?: string; color?: string; finish?: string; leather?: string;
};

const sel =
  "w-full rounded-lg border border-leather/15 bg-cream/60 px-3 py-2 text-sm text-ink " +
  "outline-none focus:border-champagne focus:ring-1 focus:ring-champagne/40 transition-colors";

export function StoreClient({ items }: { items: Item[] }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  /* carrinho = lista de linhas com id único */
  const [lines, setLines] = useState<(CartLine & { key: number })[]>([]);
  const [counter, setCounter] = useState(0);
  const [customer, setCustomer] = useState("");
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  function addToCart(it: Item) {
    const key = counter + 1;
    setCounter(key);
    setLines((prev) => [
      ...prev,
      {
        key,
        itemId: it.id,
        qty: 1,
        size: it.sizes[0],
        color: it.colors[0],
        finish: it.finishes[0],
        leather: it.leathers[0],
      },
    ]);
  }

  function updateLine(key: number, patch: Partial<CartLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  const totalQty = lines.reduce((s, l) => s + l.qty, 0);

  function buildMessage() {
    const parts = lines.map((l) => {
      const it = byId[l.itemId];
      const opts = [l.size, l.color, l.leather, l.finish].filter(Boolean).join(", ");
      return `• ${l.qty}x ${it?.name}${opts ? ` (${opts})` : ""}`;
    });
    const header = customer
      ? `Olá! Sou ${customer} e gostaria de um orçamento:`
      : "Olá! Vim pela Loja do site e gostaria de um orçamento:";
    return `${header}\n\n${parts.join("\n")}\n\nAguardo retorno. Obrigado!`;
  }

  const waHref = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`;

  function handleSend() {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
    w.gtag?.("event", "quote_request", { location: "loja", items: totalQty });
    w.fbq?.("track", "Lead", { content_name: "loja" });
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-ink/60">Ainda não há produtos cadastrados na loja. Volte em breve ou fale conosco pelo WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
      {/* ── Grade de produtos ── */}
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="group flex flex-col overflow-hidden rounded-2xl border border-leather/10 bg-white shadow-soft transition-shadow hover:shadow-premium">
              {/* Imagem */}
              <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                {it.image ? (
                  <Image src={it.image} alt={it.name} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image src="/owl-icon.png" alt="" width={64} height={64} className="h-14 w-auto opacity-30" />
                  </div>
                )}
              </div>

              {/* Info + opções */}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-champagne">{it.category}</p>
                <h3 className="mt-0.5 font-display text-lg font-semibold text-leather">{it.name}</h3>

                {/* Dropdowns de opções */}
                <div className="mt-4 space-y-2">
                  {it.sizes.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-ink/50">Tamanho</p>
                      <select className={sel} defaultValue={it.sizes[0]}>
                        {it.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  {it.colors.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-ink/50">Cor</p>
                      <select className={sel} defaultValue={it.colors[0]}>
                        {it.colors.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  {it.leathers.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-ink/50">Couro</p>
                      <select className={sel} defaultValue={it.leathers[0]}>
                        {it.leathers.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  {it.finishes.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-ink/50">Acabamento</p>
                      <select className={sel} defaultValue={it.finishes[0]}>
                        {it.finishes.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Botão adicionar (produto SEMPRE disponível) */}
                <button
                  onClick={() => addToCart(it)}
                  className="btn-gold mt-auto !py-2.5 w-full"
                >
                  + Adicionar ao orçamento
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── Resumo do orçamento ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-leather/10 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 border-b border-leather/10 pb-4">
            <ShoppingBag className="h-5 w-5 text-champagne" />
            <h2 className="font-display text-lg font-semibold text-leather">Seu Orçamento</h2>
            {totalQty > 0 && (
              <span className="ml-auto rounded-full bg-champagne px-2.5 py-0.5 text-xs font-bold text-ink">
                {totalQty}
              </span>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink/40">Adicione produtos para montar seu orçamento.</p>
            </div>
          ) : (
            <ul className="divide-y divide-leather/8 py-2 max-h-80 overflow-y-auto">
              {lines.map((l) => {
                const it = byId[l.itemId];
                const opts = [l.size, l.color, l.leather, l.finish].filter(Boolean).join(" · ");
                return (
                  <li key={l.key} className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-leather">{it?.name}</p>
                        {opts && <p className="mt-0.5 text-xs text-ink/50 leading-relaxed">{opts}</p>}
                      </div>
                      <button onClick={() => removeLine(l.key)} className="shrink-0 text-ink/30 hover:text-burgundy transition-colors" aria-label="Remover">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Qtd */}
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => l.qty > 1 ? updateLine(l.key, { qty: l.qty - 1 }) : removeLine(l.key)} className="grid h-7 w-7 place-items-center rounded-lg border border-leather/15 text-leather hover:bg-leather/5">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-leather">{l.qty}</span>
                      <button onClick={() => updateLine(l.key, { qty: l.qty + 1 })} className="grid h-7 w-7 place-items-center rounded-lg border border-leather/15 text-leather hover:bg-leather/5">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-leather/10 pt-4">
            <label className="mb-1 block text-xs font-medium text-ink/60">Seu nome (opcional)</label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Ex.: Restaurante Villa"
              className="mb-4 w-full rounded-lg border border-leather/15 bg-cream/60 px-3 py-2 text-sm text-ink outline-none focus:border-champagne"
            />
            <a
              href={lines.length ? waHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={lines.length ? handleSend : (e) => e.preventDefault()}
              aria-disabled={lines.length === 0}
              className={`btn-gold w-full !py-3 ${lines.length === 0 ? "pointer-events-none opacity-40" : ""}`}
            >
              <Send className="h-4 w-4" />
              Enviar pelo WhatsApp{totalQty > 0 ? ` (${totalQty})` : ""}
            </a>
            <p className="mt-2 text-center text-[11px] text-ink/40">
              Você será levado ao WhatsApp com o pedido já preenchido.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
