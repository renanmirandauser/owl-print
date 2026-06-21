import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { StoreClient } from "@/components/site/StoreClient";
import { listCatalog } from "@/actions/products";
import { CATEGORY_LABEL } from "@/types";

export const metadata: Metadata = {
  title: "Loja",
  description:
    "Monte seu orçamento personalizado de cardápios e acessórios em couro e envie direto para o nosso WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function LojaPage() {
  const products = await listCatalog();
  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: CATEGORY_LABEL[p.category] ?? p.category,
    image: p.gallery?.[0]?.url ?? null,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    finishes: p.finishes ?? [],
  }));

  return (
    <main>
      <Navbar />

      <section className="bg-cream">
        <div className="container py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">
            Monte e envie em 1 minuto
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather">Loja</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            Escolha os produtos, defina as opções e a quantidade. Ao finalizar, seu orçamento é
            enviado direto para o nosso WhatsApp — sem complicação.
          </p>
        </div>
      </section>

      <StoreClient items={items} />

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
