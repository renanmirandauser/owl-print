"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { CloudinaryImage } from "@/types";
import { createPartner, deletePartner, type PartnerDTO } from "@/actions/partners";

export function PartnersManager({ partners }: { partners: PartnerDTO[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  // Ao enviar imagens, cria os parceiros automaticamente (value vazio = só as novas)
  function onUpload(imgs: CloudinaryImage[]) {
    if (imgs.length === 0) return;
    setError("");
    start(async () => {
      for (const img of imgs) {
        const res = await createPartner({ url: img.url, publicId: img.publicId });
        if (!res.ok) {
          setError(res.error);
          break;
        }
      }
      router.refresh();
    });
  }

  function remove(id: string) {
    start(async () => {
      await deletePartner(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-leather/10 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-leather">Adicionar logos</h2>
        <p className="mb-4 mt-0.5 text-sm text-ink/50">
          Envie as logos dos parceiros (PNG com fundo transparente fica melhor). Elas entram
          automaticamente no carrossel da home.
        </p>
        <ImageUploader value={[]} onChange={onUpload} />
        {pending && (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/50">
            <Loader2 className="h-4 w-4 animate-spin text-champagne" /> Salvando...
          </p>
        )}
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      <div className="rounded-xl border border-leather/10 bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-semibold text-leather">
          Logos no site ({partners.length})
        </h2>
        {partners.length === 0 ? (
          <p className="text-sm text-ink/40">Nenhum parceiro ainda. Envie logos acima.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {partners.map((p) => (
              <div
                key={p.id}
                className="group relative flex h-24 items-center justify-center rounded-lg border border-leather/10 bg-cream p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name || "Parceiro"} className="max-h-full max-w-full object-contain" />
                <button
                  onClick={() => remove(p.id)}
                  disabled={pending}
                  aria-label="Excluir logo"
                  className="absolute right-1 top-1 rounded-full bg-white p-1 text-burgundy opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
