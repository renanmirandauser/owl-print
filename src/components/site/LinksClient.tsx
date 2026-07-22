"use client";

/* ══════════════════════════════════════════════════════════════════
   PÁGINA DE BIO — OWL PRINT  (/links)
   Substitui o Linktree. Fundo escuro da marca, botões grandes para
   celular, e cada clique é rastreado no GA4 + Meta Pixel.
   Links internos já saem com UTM (?utm_source=instagram) para o
   Analytics separar o tráfego que vem da bio.
   ══════════════════════════════════════════════════════════════════ */

import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageCircle,
  FileText,
  ShoppingBag,
  LayoutGrid,
  Images,
  Instagram,
} from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511953098258";
const INSTAGRAM = "https://www.instagram.com/owlprint";

const UTM = "utm_source=instagram&utm_medium=bio&utm_campaign=links";

type Item = {
  label: string;
  sub: string;
  href: string;
  icon: typeof MessageCircle;
  event: string;
  external?: boolean;
  destaque?: boolean;
};

const ITENS: Item[] = [
  {
    label: "Falar no WhatsApp",
    sub: "Atendimento e orçamento rápido",
    href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      "Olá! Vim pela bio do Instagram e gostaria de um orçamento."
    )}`,
    icon: MessageCircle,
    event: "whatsapp_click",
    external: true,
    destaque: true,
  },
  {
    label: "Solicitar orçamento",
    sub: "Conte seu projeto e receba a proposta",
    href: `/contato?${UTM}`,
    icon: FileText,
    event: "link_contato",
  },
  {
    label: "Montar orçamento na loja",
    sub: "Escolha os itens e monte você mesmo",
    href: `/loja?${UTM}`,
    icon: ShoppingBag,
    event: "link_loja",
  },
  {
    label: "Nossos produtos",
    sub: "Cardápios, jogos americanos e acessórios",
    href: `/produtos?${UTM}`,
    icon: LayoutGrid,
    event: "link_produtos",
  },
  {
    label: "Portfólio",
    sub: "Peças que já entregamos",
    href: `/portfolio?${UTM}`,
    icon: Images,
    event: "link_portfolio",
  },
  {
    label: "Instagram @owlprint",
    sub: "Acompanhe as novidades",
    href: INSTAGRAM,
    icon: Instagram,
    event: "link_instagram",
    external: true,
  },
];

export function LinksClient() {
  function track(event: string) {
    window.gtag?.("event", event, { location: "bio_links" });
    window.fbq?.("trackCustom", event, { location: "bio_links" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-cream">
      {/* clima da marca — malha embutida, não depende do globals.css */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(191,155,79,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(191,155,79,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 30%, #000 20%, transparent 75%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-champagne/[0.12] blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-14">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid h-20 w-20 place-items-center rounded-2xl border border-champagne/25 bg-white/[0.04]"
        >
          <Image
            src="/owl-icon.png"
            alt="OWL PRINT"
            width={56}
            height={56}
            priority
            className="h-12 w-auto object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-5 font-display text-2xl font-bold tracking-tight text-cream"
        >
          OWL PRINT
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-1 text-center text-sm text-cream/60"
        >
          Cardápios e acessórios de mesa personalizados em couro sintético
        </motion.p>

        {/* botões */}
        <nav className="mt-9 flex w-full flex-col gap-3.5">
          {ITENS.map((item, i) => {
            const Icon = item.icon;
            const base =
              "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300";
            const cor = item.destaque
              ? "border-champagne bg-champagne text-ink hover:bg-[#a8863f]"
              : "border-cream/15 bg-white/[0.04] text-cream hover:border-champagne/60 hover:bg-white/[0.07]";
            return (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => track(item.event)}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22 + i * 0.06 }}
                className={`${base} ${cor}`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                    item.destaque ? "bg-ink/10" : "bg-champagne/10 text-champagne"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-semibold leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      item.destaque ? "text-ink/70" : "text-cream/50"
                    }`}
                  >
                    {item.sub}
                  </span>
                </span>
              </motion.a>
            );
          })}
        </nav>

        <motion.a
          href={`/?${UTM}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 text-xs uppercase tracking-[0.2em] text-cream/40 transition-colors hover:text-champagne"
        >
          owlprintcardapios.com.br
        </motion.a>
      </div>
    </main>
  );
}
