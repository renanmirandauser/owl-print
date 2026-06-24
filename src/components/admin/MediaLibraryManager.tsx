"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Loader2, Search, PencilLine, Check, X, Tag } from "lucide-react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { CloudinaryImage } from "@/types";
import {
  registerMedia,
  updateMedia,
  deleteMedia,
  type MediaDTO,
} from "@/actions/media";

const inputCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3 py-2 text-sm text-ink " +
  "outline-none placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/25";

export function MediaLibraryManager({ media }: { media: MediaDTO[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editTags, setEditTags] = useState("");

  const filtered = media.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.alt.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function onUpload(imgs: CloudinaryImage[]) {
    if (imgs.length === 0) return;
    setError("");
    start(async () => {
      const res = await registerMedia(
        imgs.map((i) => ({ url: i.url, publicId: i.publicId }))
      );
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function startEdit(m: MediaDTO) {
    setEditingId(m.id);
    setEditAlt(m.alt);
    setEditTags(m.tags.join(", "));
  }

  function saveEdit(id: string) {
    const tags = editTags.split(",").map((t) => t.trim()).filter(Boolean);
    start(async () => {
      const res = await updateMedia(id, { alt: editAlt, tags });
      if (!res.ok) setError(res.error);
      setEditingId(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Excluir esta imagem da biblioteca?")) return;
    start(async () => {
      await deleteMedia(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-xl border border-leather/10 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-leather">
          Enviar imagens
        </h2>
        <p className="mb-4 mt-0.5 text-sm text-ink/50">
          As imagens enviadas aqui ficam guardadas e podem ser reaproveitadas em
          qualquer produto. Depois, clique em cada uma para adicionar uma
          descrição e etiquetas (ex.: couro marrom, hot stamping, cardápio).
        </p>
        <ImageUploader value={[]} onChange={onUpload} />
        {pending && (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/50">
            <Loader2 className="h-4 w-4 animate-spin text-champagne" /> Salvando...
          </p>
        )}
        {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
      </div>

      {/* Biblioteca */}
      <div className="rounded-xl border border-leather/10 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-semibold text-leather">
            Biblioteca ({media.length})
          </h2>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descrição ou etiqueta…"
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

        {media.length === 0 ? (
          <p className="text-sm text-ink/40">
            Nenhuma imagem ainda. Envie acima para começar seu banco de imagens.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink/40">
            Nenhuma imagem encontrada para “{search}”.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <div key={m.id} className="flex flex-col gap-1.5">
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-premium/15 bg-cream shadow-soft">
                  <Image
                    src={m.url}
                    alt={m.alt || ""}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-leather/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(m)}
                      title="Editar descrição e etiquetas"
                      className="rounded-full bg-white/90 p-1.5 shadow hover:bg-champagne"
                    >
                      <PencilLine className="h-3.5 w-3.5 text-leather" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      disabled={pending}
                      title="Excluir"
                      className="rounded-full bg-white/90 p-1.5 shadow hover:bg-burgundy/80"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-burgundy" />
                    </button>
                  </div>
                </div>

                {editingId === m.id ? (
                  <div className="space-y-1.5 rounded-lg border border-champagne/50 bg-champagne/5 p-2">
                    <input
                      autoFocus
                      className={inputCls}
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Descrição da imagem…"
                    />
                    <input
                      className={inputCls}
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(m.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      placeholder="Etiquetas separadas por vírgula…"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-2 py-1 text-xs text-ink/50 hover:bg-leather/5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(m.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-champagne px-2 py-1 text-xs font-semibold text-ink hover:bg-champagne/80"
                      >
                        <Check className="h-3.5 w-3.5" /> Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p
                      className="cursor-pointer truncate px-0.5 text-xs text-ink/55 hover:text-ink/80"
                      onClick={() => startEdit(m)}
                      title="Clique para editar"
                    >
                      {m.alt || (
                        <span className="italic text-ink/35">Sem descrição</span>
                      )}
                    </p>
                    {m.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-0.5">
                        {m.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-0.5 rounded-full bg-leather/5 px-1.5 py-0.5 text-[10px] text-ink/55"
                          >
                            <Tag className="h-2.5 w-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
