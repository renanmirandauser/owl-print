import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL } from "@/types";
import Link from "next/link";

const STEPS = [
  {
    n: "01",
    t: "Briefing",
    d: "Conte seu segmento, estilo e necessidade. Entendemos a sua marca e o que você precisa.",
  },
  {
    n: "02",
    t: "Orçamento & Arte",
    d: "Enviamos a proposta e desenvolvemos a arte personalizada para a sua aprovação.",
  },
  {
    n: "03",
    t: "Produção & Entrega",
    d: "Produzimos em couro com acabamento premium e entregamos no prazo, em todo o Brasil.",
  },
];

const DIFFERENTIALS = [
  { t: "Personalização exclusiva", d: "Cada peça com a identidade única do seu negócio." },
  { t: "Materiais premium", d: "Couro selecionado e acabamentos sofisticados." },
  { t: "Design sofisticado", d: "Projetos que impressionam à primeira vista." },
  { t: "Entrega nacional", d: "Atendemos restaurantes e bares em todo o Brasil." },
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* Diferenciais */}
      <section className="border-y border-leather/10 bg-white">
        <div className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIALS.map((d) => (
            <div key={d.t}>
              <h3 className="font-display text-base font-semibold text-leather">{d.t}</h3>
              <p className="mt-1 text-sm text-ink/60">{d.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produtos */}
      <section className="container py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">
            Nosso catálogo
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-leather">Nossos Produtos</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            Soluções completas e personalizadas para elevar a experiência do seu cliente —
            do cardápio aos detalhes da mesa.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {PRODUCT_CATEGORIES.map((cat) => (
            <ProductCard
              key={cat}
              slug={cat}
              category={cat}
              name={CATEGORY_LABEL[cat]}
              href="/produtos"
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/loja" className="btn-gold">
            Montar meu orçamento na Loja
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-white py-20">
        <div className="container">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">
              Simples e rápido
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold text-leather">Como Funciona</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-7">
                <div className="font-display text-4xl font-bold text-champagne">{s.n}</div>
                <h3 className="mt-3 font-display text-xl font-semibold text-leather">{s.t}</h3>
                <p className="mt-2 text-sm text-ink/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container py-20">
        <div className="overflow-hidden rounded-3xl bg-leather px-8 py-16 text-center text-cream">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Mais do que cardápios, criamos experiências que ficam na memória.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            Solicite um orçamento sem compromisso e descubra como a OWL PRINT pode transformar
            a apresentação do seu restaurante.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contato" className="btn-gold">
              Solicitar Orçamento
            </Link>
            <Link href="/loja" className="btn-outline-light">
              Ver a Loja
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-ink py-10 text-center text-sm text-cream/60">
        <p className="font-display text-base font-semibold text-cream">OWL PRINT</p>
        <p className="mt-1">Cardápios Personalizados — Design de Excelência</p>
        <p className="mt-3 text-cream/40">
          © {new Date().getFullYear()} OWL PRINT. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}
