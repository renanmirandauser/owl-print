import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a OWL PRINT e solicite seu orçamento.",
};

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-premium/10 py-3 last:border-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-leather/50">{label}</p>
        <p className="text-sm text-leather">{value}</p>
      </div>
    </div>
  );
}

export default function ContatoPage() {
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
            <Info icon="📍" label="Endereço" value="Rua das Oliveiras, 1234 — São Paulo, SP" />
            <Info icon="📞" label="Telefone" value="(11) 4002-8922" />
            <Info icon="💬" label="WhatsApp" value="(11) 98472-1130" />
            <Info icon="✉" label="E-mail" value="contato@owlprint.com.br" />
            <Info icon="🕐" label="Horário" value="Seg a Sex, 9h às 18h" />
          </div>
          <div className="mt-4 flex h-44 items-center justify-center rounded-xl bg-premium text-sm tracking-widest text-champagne">
            MAPA — SÃO PAULO, SP
          </div>
        </div>

        <ContactForm />
      </div>

      <footer className="bg-ink py-8 text-center text-sm text-cream/50">
        © {new Date().getFullYear()} OWL PRINT — Cardápios Personalizados. Todos os direitos reservados.
      </footer>
    </main>
  );
}
