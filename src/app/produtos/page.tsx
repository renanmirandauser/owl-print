import { Navbar } from "@/components/site/Navbar";
import { ProductCard } from "@/components/products/ProductCard";
import { listCatalog } from "@/actions/products";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL, type ProductCategory } from "@/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo de cardápios, cartas de vinho, jogos americanos e acessórios de couro personalizados da OWL PRINT.",
};

export default async function CatalogPage() {
  const products = await listCatalog();
  const byCategory = (cat: ProductCategory) => products.filter((p) => p.category === cat);

  return (
    <main>
      <Navbar />
      <div className="bg-leather py-16 text-center text-cream">
        <h1 className="font-display text-4xl">Nossos Produtos</h1>
        <p className="mt-2 text-cream/70">Soluções completas e personalizadas para o seu restaurante.</p>
      </div>

      <div className="container space-y-14 py-14">
        {products.length === 0 && (
          <p className="text-center text-leather/50">Catálogo em breve.</p>
        )}
        {PRODUCT_CATEGORIES.map((cat) => {
          const items = byCategory(cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="mb-6 font-display text-2xl text-leather">{CATEGORY_LABEL[cat]}</h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    category={p.category}
                    image={p.gallery[0]?.url}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
