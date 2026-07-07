"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MessageSquare, Phone, Mail, Tag, StickyNote, Send, Loader2, Trash2 } from "lucide-react";
import { addActivity, removeActivity, type ActivityDTO } from "@/actions/clients";

const ICONS: Record<string, typeof StickyNote> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  status: Tag,
};

export function ActivityTimeline({ id, activities }: { id: string; activities: ActivityDTO[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  function excluir(a: ActivityDTO) {
    if (!confirm("Excluir este registro do histórico?")) return;
    setDeleting(a.at + a.content);
    startTransition(async () => {
      const res = await removeActivity(id, a.at, a.content);
      setDeleting(null);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  function submit() {
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await addActivity(id, text);
      if (res.ok) {
        setText("");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-premium/10 bg-white p-5">
      <h2 className="mb-4 font-display text-lg text-leather">Histórico</h2>

      {/* Adicionar nota */}
      <div className="mb-6 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Registrar contato ou anotação..."
          className="flex-1 rounded-md border border-premium/20 px-3 py-2 text-sm outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
        />
        <button onClick={submit} disabled={pending} className="btn-gold !px-3 !py-2 disabled:opacity-50">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <p className="text-sm text-leather/50">Sem registros ainda.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-premium/15 pl-5">
          {activities.map((a, i) => {
            const Icon = ICONS[a.type] ?? StickyNote;
            return (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] grid h-5 w-5 place-items-center rounded-full bg-cream ring-1 ring-premium/15">
                  <Icon className="h-3 w-3 text-premium" />
                </span>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-leather">{a.content}</p>
                  <button
                    onClick={() => excluir(a)}
                    disabled={deleting === a.at + a.content}
                    title="Excluir registro"
                    className="shrink-0 rounded-md p-1 text-leather/30 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting === a.at + a.content ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <time className="text-xs text-leather/40">
                  {new Date(a.at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
