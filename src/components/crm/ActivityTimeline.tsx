"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MessageSquare, Phone, Mail, Tag, StickyNote, Send, Loader2 } from "lucide-react";
import { addActivity, type ActivityDTO } from "@/actions/clients";

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
                <p className="text-sm text-leather">{a.content}</p>
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
