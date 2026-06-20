import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL } from "@/types";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* Produtos */}
      <section className="container py-20">
        <div className="text-center">
          <h2 className="font-display text-4xl text-leather">Nossos Produtos</h2>
          <p className="mt-3 text-leather/60">
            Soluções completas e personalizadas para o seu restaurante.
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
      </section>

      {/* CTA final */}
      <section className="bg-premium py-20 text-center text-cream">
        <div className="container">
          <h2 className="font-display text-3xl">
            Mais do que cardápios, criamos experiências que ficam na memória.
          </h2>
          <Link href="/contato" className="btn-gold mt-8">
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
