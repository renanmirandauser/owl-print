"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createBriefing } from "@/actions/briefings";

const inputCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3.5 py-2.5 text-[15px] text-ink " +
  "outline-none transition-colors placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/25";

const SEGMENTS_OPT = ["Restaurante", "Bar", "Hotel", "Motel", "Cafeteria", "Pub", "Pizzaria", "Outro"];
const STYLE_OPT = ["Sofisticado / Premium", "Casual", "Rústico", "Moderno", "Clássico", "Outro"];
const BRANDING_OPT = ["Sim, já tenho logo", "Não tenho", "Está em criação"];
const PROJECT_OPT = ["Nova criação", "Reformular cardápio existente", "Reimpressão"];
const PRODUCT_OPT = ["Cardápio", "Carta de Vinhos", "Menu de Drinks", "Jogo Americano", "Porta-Contas", "Porta-Talheres", "Porta-Copos", "Display", "Outro"];
const SIZE_OPT = ["A4", "A5", "Personalizado", "Não sei"];
const FINISH_OPT = ["Hot Stamping", "Baixo Relevo", "Laser", "Não sei"];
const LOGO_OPT = ["Centro", "Superior", "Inferior", "Não sei"];
const CONTENT_OPT = ["Sim, tenho tudo pronto", "Parcialmente", "Não, preciso de ajuda"];
const DEADLINE_OPT = ["Sem pressa", "Até 15 dias", "Até 30 dias", "Urgente"];
const BUDGET_OPT = ["Até R$ 1.000", "R$ 1.000 a R$ 3.000", "R$ 3.000 a R$ 5.000", "Acima de R$ 5.000", "Prefiro não informar"];

const EMPTY = {
  responsible: "", company: "", whatsapp: "", email: "", instagram: "", city: "",
  segment: "", style: "", audience: "", hasBranding: "",
  projectType: "", quantity: "", size: "", colorPreference: "", logoPosition: "",
  pages: "", languages: "", contentReady: "",
  references: "", deadline: "", budget: "", notes: "", website: "",
};

export function BriefingForm() {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ ...EMPTY });
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [finishes, setFinishes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createBriefing({ ...form, productTypes, finishes });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      try {
        const w = window as unknown as {
          gtag?: (...a: unknown[]) => void;
          fbq?: (...a: unknown[]) => void;
        };
        w.gtag?.("event", "briefing_submit");
        w.fbq?.("track", "Lead", { content_name: "Briefing" });
      } catch {
        /* ignora */
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-leather/10 bg-white p-10 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="mt-4 font-display text-2xl font-bold text-leather">Briefing enviado com sucesso!</h2>
        <p className="mx-auto mt-2 max-w-md text-ink/60">
          Recebemos as informações do seu projeto. Nossa equipe vai analisar e entrar em contato
          em breve pelo WhatsApp para dar continuidade à sua criação.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">Voltar ao início</Link>
          <Link href="/portfolio" className="btn-outline">Ver nossos cases</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* honeypot anti-spam (escondido) */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {/* 1. Seus dados */}
      <Section title="1. Seus dados" subtitle="Para entrarmos em contato com você.">
        <Field label="Seu nome" required>
          <input className={inputCls} value={form.responsible} onChange={set("responsible")} placeholder="Ex.: Maria Silva" />
        </Field>
        <Field label="Nome do estabelecimento" required>
          <input className={inputCls} value={form.company} onChange={set("company")} placeholder="Ex.: Restaurante Villa" />
        </Field>
        <Field label="WhatsApp" required>
          <input className={inputCls} value={form.whatsapp} onChange={set("whatsapp")} placeholder="(11) 99999-9999" />
        </Field>
        <Field label="E-mail">
          <input className={inputCls} value={form.email} onChange={set("email")} placeholder="contato@seurestaurante.com" />
        </Field>
        <Field label="Instagram">
          <input className={inputCls} value={form.instagram} onChange={set("instagram")} placeholder="@seurestaurante" />
        </Field>
        <Field label="Cidade / Estado">
          <input className={inputCls} value={form.city} onChange={set("city")} placeholder="Ex.: São Paulo / SP" />
        </Field>
      </Section>

      {/* 2. Sobre o estabelecimento */}
      <Section title="2. Sobre o estabelecimento" subtitle="Conte um pouco sobre o seu negócio.">
        <Field label="Segmento">
          <Select value={form.segment} onChange={set("segment")} options={SEGMENTS_OPT} />
        </Field>
        <Field label="Estilo do estabelecimento">
          <Select value={form.style} onChange={set("style")} options={STYLE_OPT} />
        </Field>
        <Field label="Já possui logo / identidade visual?">
          <Select value={form.hasBranding} onChange={set("hasBranding")} options={BRANDING_OPT} />
        </Field>
        <Field label="Público-alvo">
          <input className={inputCls} value={form.audience} onChange={set("audience")} placeholder="Ex.: famílias, executivos, jovens..." />
        </Field>
      </Section>

      {/* 3. Sobre o cardápio */}
      <Section title="3. Sobre o cardápio" subtitle="Os detalhes da criação que você precisa.">
        <Field label="Tipo de projeto">
          <Select value={form.projectType} onChange={set("projectType")} options={PROJECT_OPT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="O que você precisa?" hint="Pode marcar mais de um.">
            <Chips options={PRODUCT_OPT} selected={productTypes} onToggle={(v) => toggle(productTypes, setProductTypes, v)} />
          </Field>
        </div>
        <Field label="Quantidade desejada">
          <input className={inputCls} value={form.quantity} onChange={set("quantity")} placeholder="Ex.: 20 unidades" />
        </Field>
        <Field label="Tamanho">
          <Select value={form.size} onChange={set("size")} options={SIZE_OPT} />
        </Field>
        <Field label="Cor / couro de preferência">
          <input className={inputCls} value={form.colorPreference} onChange={set("colorPreference")} placeholder="Ex.: Marrom, Preto, Vinho..." />
        </Field>
        <Field label="Posição da logo">
          <Select value={form.logoPosition} onChange={set("logoPosition")} options={LOGO_OPT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Acabamento" hint="Pode marcar mais de um.">
            <Chips options={FINISH_OPT} selected={finishes} onToggle={(v) => toggle(finishes, setFinishes, v)} />
          </Field>
        </div>
        <Field label="Nº de páginas / itens (aprox.)">
          <input className={inputCls} value={form.pages} onChange={set("pages")} placeholder="Ex.: 12 páginas" />
        </Field>
        <Field label="Idiomas">
          <input className={inputCls} value={form.languages} onChange={set("languages")} placeholder="Ex.: Português / Inglês" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Você já tem o conteúdo (textos e itens) do cardápio?">
            <Select value={form.contentReady} onChange={set("contentReady")} options={CONTENT_OPT} />
          </Field>
        </div>
      </Section>

      {/* 4. Referências e prazo */}
      <Section title="4. Referências e prazo" subtitle="Quanto mais detalhes, melhor a sua criação.">
        <div className="sm:col-span-2">
          <Field label="Referências e inspirações" hint="Descreva o que você gosta ou cole links de exemplos.">
            <textarea rows={3} className={inputCls} value={form.references} onChange={set("references")} placeholder="Ex.: gosto de cardápios escuros, com letras douradas..." />
          </Field>
        </div>
        <Field label="Prazo desejado">
          <Select value={form.deadline} onChange={set("deadline")} options={DEADLINE_OPT} />
        </Field>
        <Field label="Faixa de orçamento">
          <Select value={form.budget} onChange={set("budget")} options={BUDGET_OPT} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Observações">
            <textarea rows={3} className={inputCls} value={form.notes} onChange={set("notes")} placeholder="Qualquer outra informação importante para o seu projeto." />
          </Field>
        </div>
      </Section>

      {error && (
        <p className="rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">
          {error}
        </p>
      )}

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-sm text-ink/50 sm:mr-auto">Os campos com <span className="text-champagne">*</span> são obrigatórios.</p>
        <button onClick={submit} disabled={pending} className="btn-gold !px-8 !py-3 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar briefing
        </button>
      </div>
    </div>
  );
}

/* ─── subcomponentes ───────────────────────────────────────── */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
      <h2 className="font-display text-xl font-semibold text-leather">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {required && <span className="text-champagne">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <select className={inputCls} value={value} onChange={onChange}>
      <option value="">Selecione...</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (on
                ? "border-champagne bg-champagne text-ink"
                : "border-leather/20 bg-white text-ink/70 hover:border-champagne hover:bg-champagne/10")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
