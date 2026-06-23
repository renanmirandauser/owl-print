import { Navbar } from "@/components/site/Navbar";
import { BriefingForm } from "@/components/site/BriefingForm";
import { listSegments, listFinishes, listCatalogItems } from "@/actions/catalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Briefing de Criação",
  description: "Envie o briefing do seu projeto de cardápio personalizado e receba uma proposta sob medida da OWL PRINT.",
};

export default async function BriefingPage() {
  const [segments, categories, colors, leathers, finishes, sizes] = await Promise.all([
    listSegments(),
    listCatalogItems("category").then((items) => items.map((i) => i.name)),
    listCatalogItems("color").then((items) => items.map((i) => i.name)),
    listCatalogItems("leather").then((items) => items.map((i) => i.name)),
    listFinishes(),
    listCatalogItems("size").then((items) => items.map((i) => i.name)),
  ]);

  return (
    <main>
      <Navbar />
      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Briefing</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Conte-nos sobre o seu projeto</h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink/60">
            Preencha o briefing abaixo. Quanto mais detalhes, mais precisa será nossa proposta.
          </p>
        </div>
      </header>
      <div className="container max-w-3xl py-12">
        <BriefingForm
          segmentOptions={segments}
          categoryOptions={categories}
          colorOptions={colors}
          leatherOptions={leathers}
          finishOptions={finishes}
          sizeOptions={sizes}
        />
      </div>
      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
