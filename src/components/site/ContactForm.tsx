"use client";

import { useState } from "react";
import { track } from "@/components/analytics/Analytics";

type Status = "idle" | "sending" | "ok" | "error";

export function ContactForm({ segmentOptions = [] }: { segmentOptions?: string[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    segment: "",
    message: "",
    website: "", // honeypot anti-spam (não preencher)
  });

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [k]: e.target.value }));

  async function submit() {
    if (form.name.trim().length < 2) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const notes =
      (form.segment ? `Segmento: ${form.segment}. ` : "") + (form.message || "");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          phone: form.phone,
          email: form.email,
          notes,
          source: "site",
          website: form.website, // honeypot
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("ok");
        track("contact_submit", { source: "site" });
        setForm({ name: "", company: "", phone: "", email: "", segment: "", message: "", website: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-lg border border-leather/15 bg-white px-3 py-2 text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

  return (
    <div className="rounded-xl border border-leather/10 bg-white p-6 shadow-soft">
      <h2 className="font-display text-2xl font-semibold text-leather">Solicite seu orçamento</h2>
      <p className="mt-1 text-sm text-ink/60">
        Responda em poucos campos — nossa equipe retorna rapidinho.
      </p>

      {/* honeypot: invisível para humanos, capturado por bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={upd("website")}
        className="hidden"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-ink/60">Nome *</label>
          <input className={field} maxLength={120} value={form.name} onChange={upd("name")} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink/60">Empresa</label>
          <input className={field} maxLength={160} value={form.company} onChange={upd("company")} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink/60">WhatsApp</label>
          <input className={field} maxLength={40} value={form.phone} onChange={upd("phone")} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink/60">E-mail</label>
          <input className={field} maxLength={160} value={form.email} onChange={upd("email")} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-ink/60">Segmento</label>
          <select className={field} value={form.segment} onChange={upd("segment")}>
            <option value="">Selecione...</option>
            {segmentOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-ink/60">Mensagem</label>
          <textarea
            rows={4}
            maxLength={3000}
            className={field}
            value={form.message}
            onChange={upd("message")}
            placeholder="Conte o que você precisa, quantidades, prazos..."
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={status === "sending"}
          className="btn-gold disabled:opacity-60"
        >
          {status === "sending" ? "Enviando..." : "Enviar mensagem"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-emerald-700">Recebido! Entraremos em contato. ✓</span>
        )}
        {status === "error" && (
          <span className="text-sm text-burgundy">
            Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.
          </span>
        )}
      </div>
    </div>
  );
}
