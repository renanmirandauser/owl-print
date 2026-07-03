"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* realces suaves em dourado/azul */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-champagne/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-leather/5 blur-3xl" />

      <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-leather md:text-6xl">
            Cardápios que<br />
            <span className="text-champagne">Contam Histórias</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink/70">
            Cardápios, jogos americanos, porta contas, porta talheres todos feitos sob medida para
            restaurantes, bares, hotéis e motéis. Design exclusivo e acabamento premium
            que valorizam a sua marca.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contato" className="btn-gold">
              Solicitar Orçamento
            </Link>
            <Link href="/loja" className="btn-outline">
              Montar Orçamento na Loja
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/60">
            <span>✓ Personalização exclusiva</span>
            <span>✓ Acabamento premium</span>
            <span>✓ Entrega para todo o Brasil</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-leather/10 bg-white shadow-premium"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-champagne/20" />
          <Image
            src="/owl-sobre-nos.jpg"
            alt="Mascote OWL PRINT"
            width={900}
            height={900}
            priority
            className="h-[78%] w-auto drop-shadow-xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
