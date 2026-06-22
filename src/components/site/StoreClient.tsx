"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Send } from "lucide-react";

type Item = {
  id: string;
  name: string;
  category: string;
  image: string | null;
  sizes: string[];
  colors: string[];
  finishes: string[];
};

type Line = { qty: number; size?: string; color?: string; finish?: string };

export function StoreClient({ items }: { items: Item[] }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const [cart, setCart] = useState<Record<string, Line>>({});
  const [customer, setCustomer] = useState("");

  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const lines = Object.entries(cart).filter(([, l]) => l.qty > 0);
  const totalQty = lines.reduce((s, [, l]) => s + l.qty, 0);

  function setLine(id: string, patch: Partial<Line>) {
    setCart((c) => {
      const item = byId[id];
      const prev = c[id] ?? {
        qty: 0,
        size: item?.sizes?.[0],
        color: item?.colors?.[0],
        finish: item?.finishes?.[0],
      };
      return { ...c, [id]: { ...prev, ...patch } };
    });
  }

  function changeQty(id: string, delta: number) {
    const current = cart[id]?.qty ?? 0;
    setLine(id, { qty: Math.max(0, current + delta) });
  }

  function buildMessage() {
    const parts = lines.map(([id, l]) => {
      const it = byId[id];
      const opts = [l.size, l.color, l.finish].filter(Boolean).join(", ");
      return `• ${l.qty}x ${it?.name}${opts ? ` (${opts})` : ""}`;
    });
    const header = customer
      ? `Olá! Sou ${customer} e gostaria de um orçamento dos seguintes itens:`
      : "Olá! Vim pela Loja do site e gostaria de um orçamento dos itens:";
    return `${header}\n\n${parts.join("\n")}\n\nAguardo retorno. Obrigado!`;
  }

  const waHref = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`;

  function handleSend() {
    window.gtag?.("event", "quote_request", { location: "loja", items: totalQty });
    window.fbq?.("track", "Lead", { content_name: "loja" });
  }

  const selectCls =
    "w-full rounded-md border border-leather/15 bg-cream px-2 py-1.5 text-xs text-ink outline-none focus:border-champagne";

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-ink/60">
          Ainda não há produtos cadastrados na loja. Volte em breve ou fale conosco pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_340px]">
      {/* Lista de produtos */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => {
          const line = cart[it.id];
          const qty = line?.qty ?? 0;
          return (
            <div key={it.id} className="card flex flex-col overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center bg-cream">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <Image src="/owl-icon.png" alt="" width={64} height={64} className="h-16 w-auto opacity-40" />
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[11px] uppercase tracking-wide text-champagne">{it.category}</p>
                <h3 className="font-display text-base font-semibold text-leather">{it.name}</h3>

                <div className="mt-3 space-y-2">
                  {it.sizes.length > 0 && (
                    <select
                      className={selectCls}
                      value={line?.size ?? it.sizes[0]}
                      onChange={(e) => setLine(it.id, { size: e.target.value })}
                    >
                      {it.sizes.map((s) => (
                        <option key={s} value={s}>Tamanho: {s}</option>
                      ))}
                    </select>
                  )}
                  {it.colors.length > 0 && (
                    <select
                      className={selectCls}
                      value={line?.color ?? it.colors[0]}
                      onChange={(e) => setLine(it.id, { color: e.target.value })}
                    >
                      {it.colors.map((s) => (
                        <option key={s} value={s}>Cor: {s}</option>
                      ))}
                    </select>
                  )}
                  {it.finishes.length > 0 && (
                    <select
                      className={selectCls}
                      value={line?.finish ?? it.finishes[0]}
                      onChange={(e) => setLine(it.id, { finish: e.target.value })}
                    >
                      {it.finishes.map((s) => (
                        <option key={s} value={s}>Acabamento: {s}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  {qty === 0 ? (
                    <button
                      onClick={() => changeQty(it.id, 1)}
                      className="btn-gold w-full !py-2 text-sm"
                    >
                      Adicionar
                    </button>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-leather/15 p-1">
                      <button
                        onClick={() => changeQty(it.id, -1)}
                        className="grid h-8 w-8 place-items-center rounded-md hover:bg-leather/5"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-4 w-4 text-leather" />
                      </button>
                      <span className="font-semibold text-leather">{qty}</span>
                      <button
                        onClick={() => changeQty(it.id, 1)}
                        className="grid h-8 w-8 place-items-center rounded-md hover:bg-leather/5"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-4 w-4 text-leather" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo do orçamento */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <div className="flex items-center gap-2 border-b border-leather/10 pb-3">
            <ShoppingBag className="h-5 w-5 text-champagne" />
            <h2 className="font-display text-lg font-semibold text-leather">Seu Orçamento</h2>
          </div>

          {lines.length === 0 ? (
            <p className="py-6 text-sm text-ink/50">
              Adicione produtos para montar seu orçamento.
            </p>
          ) : (
            <ul className="divide-y divide-leather/10 py-2">
              {lines.map(([id, l]) => {
                const it = byId[id];
                const opts = [l.size, l.color, l.finish].filter(Boolean).join(" · ");
                return (
                  <li key={id} className="flex items-start justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-medium text-leather">{it?.name}</p>
                      {opts && <p className="text-xs text-ink/50">{opts}</p>}
                    </div>
                    <span className="whitespace-nowrap font-semibold text-ink/70">{l.qty}x</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-2 border-t border-leather/10 pt-3">
            <label className="mb-1 block text-xs text-ink/60">Seu nome (opcional)</label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Ex.: Restaurante Villa"
              className="mb-3 w-full rounded-md border border-leather/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-champagne"
            />

            <a
              href={lines.length ? waHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={lines.length ? handleSend : (e) => e.preventDefault()}
              aria-disabled={lines.length === 0}
              className={`btn-gold w-full ${lines.length === 0 ? "pointer-events-none opacity-50" : ""}`}
            >
              <Send className="h-4 w-4" />
              Enviar pelo WhatsApp {totalQty > 0 ? `(${totalQty})` : ""}
            </a>
            <p className="mt-2 text-center text-[11px] text-ink/40">
              Você será levado ao WhatsApp com seu pedido já preenchido.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
