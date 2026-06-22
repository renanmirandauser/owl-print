"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MessageCircle, Trash2, Loader2 } from "lucide-react";
import { deleteClient } from "@/actions/clients";

export function ClientActions({
  id,
  whatsapp,
}: {
  id: string;
  whatsapp?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm("Excluir este lead? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await deleteClient(id);
      if (res.ok) router.push("/admin/crm");
    });
  }

  const phone = (whatsapp ?? "").replace(/\D/g, "");

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
        </a>
      )}
      <button
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-burgundy" />}
        Excluir
      </button>
    </div>
  );
}
