import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";

export const metadata: Metadata = {
  title: "Como Funciona",
  description:
    "Veja como funciona o processo da OWL PRINT: briefing, orçamento e arte, produção e entrega de cardápios personalizados.",
};

const steps = [
  {
    n: "1",
    t: "Briefing",
    d: "Você conta seu segmento, estilo e necessidade. Entendemos sua marca e o que você precisa.",
  },
  {
    n: "2",
    t: "Orçamento & Arte",
    d: "Enviamos a proposta e desenvolvemos a arte personalizada para sua aprovação.",
  },
  {
    n: "3",
    t: "Produção",
    d: "Após aprovado, produzimos sua peça em couro com acabamento premium (hot stamping, laser, baixo relevo).",
  },
  {
    n: "4",
    t: "Entrega",
    d: "Entregamos no prazo combinado, em todo o Brasil, com a qualidade que valoriza seu negócio.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main>
      <Navbar />
      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Processo</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Como Funciona</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Do briefing à entrega, um processo simples e cuidadoso.</p>
        </div>
      </header>

      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <div
              key={s.n}
              className="flex gap-5 rounded-xl border border-premium/15 bg-white p-6 shadow-sm"
            >
              <div className="font-display text-5xl text-champagne">{s.n}</div>
              <div>
                <h3 className="font-display text-xl text-leather">{s.t}</h3>
                <p className="mt-2 text-sm text-leather/60">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/contato" className="btn-gold">
            Solicitar Orçamento
          </Link>
        </div>
      </section>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
