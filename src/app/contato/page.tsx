import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { ContactForm } from "@/components/site/ContactForm";
import { listSegments } from "@/actions/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a OWL PRINT e solicite seu orçamento.",
};

function Info({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const content = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-leather underline-offset-2 hover:underline">
      {value}
    </a>
  ) : (
    <p className="text-sm text-leather">{value}</p>
  );
  return (
    <div className="flex gap-3 border-b border-premium/10 py-3 last:border-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-leather/50">{label}</p>
        {content}
      </div>
    </div>
  );
}

export default async function ContatoPage() {
  const segments = await listSegments();

  return (
    <main>
      <Navbar />
      <header className="border-b border-leather/10 bg-white">
        <div className="container py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Contato</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-leather md:text-5xl">Fale Conosco</h1>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Vamos criar algo memorável para o seu negócio.</p>
        </div>
      </header>

      <div className="container grid gap-8 py-14 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-2xl text-leather">Informações</h2>
          <div className="mt-3 rounded-xl border border-premium/15 bg-white px-5 py-2 shadow-sm">
            <Info
              icon="💬"
              label="WhatsApp"
              value="(11) 95309-8258"
              href="https://wa.me/5511953098258?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20OWL%20PRINT%20e%20gostaria%20de%20um%20or%C3%A7amento."
            />
            <Info icon="📞" label="Telefone" value="(11) 95309-8258" href="tel:+5511953098258" />
            <Info icon="✉" label="E-mail" value="contato@owlprint.com.br" />
            <Info icon="🕐" label="Horário" value="Seg a Sex, 9h às 18h" />
          </div>
          <div className="mt-4 rounded-xl border border-premium/15 bg-cream px-5 py-4 text-sm text-leather/80">
            🛒 Atendemos exclusivamente online — orçamentos, pedidos e entregas em toda a Grande São Paulo.
          </div>
        </div>
        <ContactForm segmentOptions={segments} />
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados.
      </footer>
    </main>
  );
}
