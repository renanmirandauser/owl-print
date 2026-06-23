import { Navbar } from "@/components/site/Navbar";
import { BriefingForm } from "@/components/site/BriefingForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Briefing de Criação",
  description:
    "Envie o briefing do seu projeto de cardápio personalizado e receba uma proposta sob medida da OWL PRINT.",
};

export default function BriefingPage() {
  return (
    <main>
      <Navbar />

      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Briefing</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">
            Conte-nos sobre o seu projeto
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink/60">
            Preencha o briefing abaixo com os detalhes do seu cardápio personalizado.
            Quanto mais informações você der, mais precisa será a nossa proposta.
          </p>
        </div>
      </header>

      <div className="container max-w-3xl py-12">
        <BriefingForm />
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
