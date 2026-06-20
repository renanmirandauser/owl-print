"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-leather text-cream">
      {/* textura/gradiente premium */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-leather via-premium to-ink opacity-90" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-champagne/10 blur-3xl" />

      <div className="container relative grid items-center gap-12 py-24 md:grid-cols-2 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-champagne">
            Cardápios Personalizados • Est. 2024
          </p>
          <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">
            Cardápios que<br />
            <span className="text-champagne">Contam Histórias</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream/80">
            Soluções personalizadas para restaurantes, bares, hotéis e motéis.
            Couro, acabamento e excelência em cada detalhe.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contato" className="btn-gold">
              Solicitar Orçamento
            </Link>
            <Link href="/produtos" className="btn-outline">
              Ver Catálogo
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto aspect-[3/4] w-full max-w-sm rounded-2xl bg-gradient-to-b from-premium to-ink shadow-premium ring-1 ring-champagne/30"
        >
          {/* Substitua pela arte do mascote segurando o cardápio de couro */}
          <div className="flex h-full items-center justify-center text-7xl">🦉</div>
        </motion.div>
      </div>
    </section>
  );
}
