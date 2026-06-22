"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { saveLojaContent, type LojaContent } from "@/actions/content";

const inputCls =
  "w-full rounded-md border border-leather/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

export function LojaContentForm({ initial }: { initial: LojaContent }) {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function save() {
    setError("");
    setSaved(false);
    start(async () => {
      const res = await saveLojaContent({ eyebrow, title, description });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-5 rounded-xl border border-leather/10 bg-white p-6 shadow-soft">
      <div>
        <label className="mb-1 block text-xs text-ink/60">Texto pequeno (acima do título)</label>
        <input className={inputCls} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} maxLength={80} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink/60">Título</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink/60">Descrição</label>
        <textarea
          rows={3}
          className={inputCls}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={400}
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Salvar textos
        </button>
        {saved && <span className="text-sm text-emerald-700">Salvo! ✓</span>}
        {error && <span className="text-sm text-burgundy">{error}</span>}
      </div>

      <p className="border-t border-leather/10 pt-4 text-xs text-ink/40">
        As alterações aparecem na página da Loja em alguns segundos após salvar.
      </p>
    </div>
  );
}
