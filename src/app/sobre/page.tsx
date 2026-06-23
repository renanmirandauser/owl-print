import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça a OWL PRINT — especialista em cardápios e acessórios de couro personalizados para restaurantes, bares, hotéis e motéis.",
};

const values = [
  { t: "Artesania", d: "Cada peça é produzida com couro selecionado e acabamento minucioso." },
  { t: "Exclusividade", d: "Projetos sob medida, com a identidade única de cada cliente." },
  { t: "Excelência", d: "Padrão premium do briefing à entrega, no prazo combinado." },
];

export default function SobrePage() {
  return (
    <main>
      <Navbar />
      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">A OWL PRINT</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Sobre Nós</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Mais do que cardápios — criamos experiências.</p>
        </div>
      </header>

      <section className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-3xl text-leather">Nossa história</h2>
          <p className="mt-4 text-leather/70">
            A OWL PRINT nasceu da paixão por unir gastronomia e design. Percebemos que o cardápio é o
            primeiro contato do cliente com a experiência de um restaurante — e decidimos transformá-lo
            em uma peça memorável, feita em couro, com acabamento sofisticado.
          </p>
          <p className="mt-4 text-leather/70">
            Hoje atendemos restaurantes, bares, hotéis e motéis em todo o Brasil, entregando cardápios,
            cartas de vinho, jogos americanos, porta-copos, porta-talheres, porta-contas e displays — sempre
            personalizados e com excelência em cada detalhe.
          </p>
          <Link href="/contato" className="btn-gold mt-8">
            Solicitar Orçamento
          </Link>
        </div>
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-premium text-7xl text-champagne">
          🦉
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <h2 className="text-center font-display text-3xl text-leather">Nossos valores</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.t}
                className="rounded-xl border border-premium/15 bg-cream/40 p-6"
              >
                <h3 className="font-display text-xl text-leather">{v.t}</h3>
                <p className="mt-2 text-sm text-leather/60">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
