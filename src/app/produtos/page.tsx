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

  // Rótulo da categoria (funciona para padrão e personalizada)
  const labelOf = (cat: string) => CATEGORY_LABEL[cat as ProductCategory] ?? cat;

  // Agrupa os produtos pelo rótulo da categoria
  const groups = new Map<string, typeof products>();
  for (const p of products) {
    const label = labelOf(p.category);
    const arr = groups.get(label) ?? [];
    arr.push(p);
    groups.set(label, arr);
  }

  // Ordena: categorias padrão primeiro (na ordem), depois as personalizadas
  const defaultLabels = PRODUCT_CATEGORIES.map((c) => CATEGORY_LABEL[c]);
  const orderedLabels = [
    ...defaultLabels.filter((l) => groups.has(l)),
    ...[...groups.keys()].filter((l) => !defaultLabels.includes(l)),
  ];

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
        {orderedLabels.map((label) => {
          const items = groups.get(label) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={label}>
              <h2 className="mb-6 font-display text-2xl text-leather">{label}</h2>
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
