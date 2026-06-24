"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Star, PencilLine, Check, Images } from "lucide-react";
import type { CloudinaryImage } from "@/types";
import { MediaLibraryPicker } from "@/components/shared/MediaLibraryPicker";
import { registerMedia } from "@/actions/media";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Props {
  value: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  /**
   * Quando true, exibe o botão "Escolher da biblioteca" e registra os
   * uploads novos no banco central de imagens. Padrão: false.
   */
  enableLibrary?: boolean;
}

export function ImageUploader({ value, onChange, enableLibrary = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!CLOUD || !PRESET) { setError("Configure as variáveis do Cloudinary no .env.local."); return; }
    setError(null);
    setUploading(true);
    try {
      const uploaded: CloudinaryImage[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
        if (!res.ok) throw new Error("upload");
        const data = await res.json();
        uploaded.push({ url: data.secure_url, publicId: data.public_id });
      }
      onChange([...value, ...uploaded]);
      // Alimenta o banco central de imagens (sem duplicar — upsert por publicId).
      if (enableLibrary) {
        registerMedia(uploaded.map((u) => ({ url: u.url, publicId: u.publicId }))).catch(() => {});
      }
    } catch {
      setError("Falha no upload de uma ou mais imagens.");
    } finally {
      setUploading(false);
    }
  }

  function addFromLibrary(imgs: CloudinaryImage[]) {
    const existing = new Set(value.map((v) => v.publicId).filter(Boolean));
    const novas = imgs.filter((i) => !i.publicId || !existing.has(i.publicId));
    if (novas.length) onChange([...value, ...novas]);
    setPickerOpen(false);
  }

  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function makeMain(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [img] = next.splice(i, 1);
    onChange([img, ...next]);
  }
  function startEdit(i: number) { setEditingIdx(i); setEditText(value[i].alt ?? ""); }
  function saveEdit(i: number) {
    const next = [...value];
    next[i] = { ...next[i], alt: editText.trim() };
    onChange(next);
    setEditingIdx(null);
  }

  return (
    <div>
      {enableLibrary && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-champagne/60 bg-champagne/10 px-3.5 py-2 text-sm font-semibold text-premium transition-colors hover:bg-champagne/20"
          >
            <Images className="h-4 w-4" /> Escolher da biblioteca
          </button>
          <span className="text-xs text-ink/45">ou envie novas imagens abaixo (entram na biblioteca automaticamente).</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <div key={img.publicId || i} className="group flex flex-col gap-1">
            {/* Miniatura */}
            <div className="relative aspect-square overflow-hidden rounded-xl border border-premium/15 bg-cream shadow-soft">
              <Image src={img.url} alt={img.alt || ""} fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full bg-champagne px-2 py-0.5 text-[10px] font-semibold text-ink">
                  <Star className="h-2.5 w-2.5" /> Capa
                </span>
              )}
              {/* Botões hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-leather/60 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button type="button" onClick={() => makeMain(i)} title="Tornar capa" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-champagne">
                    <Star className="h-3.5 w-3.5 text-leather" />
                  </button>
                )}
                <button type="button" onClick={() => startEdit(i)} title="Editar descrição" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-champagne">
                  <PencilLine className="h-3.5 w-3.5 text-leather" />
                </button>
                <button type="button" onClick={() => remove(i)} title="Remover" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-burgundy/80">
                  <X className="h-3.5 w-3.5 text-burgundy" />
                </button>
              </div>
            </div>

            {/* Descrição / alt */}
            {editingIdx === i ? (
              <div className="flex gap-1">
                <input
                  autoFocus
                  className="min-w-0 flex-1 rounded-lg border border-champagne px-2 py-1 text-xs outline-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(i); if (e.key === "Escape") setEditingIdx(null); }}
                  placeholder="Descrição da imagem..."
                />
                <button type="button" onClick={() => saveEdit(i)} className="rounded-lg bg-champagne px-2 py-1 text-xs text-ink hover:bg-champagne/80">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p
                className="cursor-pointer truncate rounded px-1 text-xs text-ink/45 hover:text-ink/70"
                onClick={() => startEdit(i)}
                title="Clique para editar descrição"
              >
                {img.alt || <span className="italic">Sem descrição — clique para editar</span>}
              </p>
            )}
          </div>
        ))}

        {/* Botão adicionar */}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-premium/25 text-leather/50 transition-colors hover:border-champagne hover:text-champagne">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          <span className="text-xs font-medium">{uploading ? "Enviando..." : "Adicionar"}</span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-burgundy">{error}</p>}

      {pickerOpen && (
        <MediaLibraryPicker
          existingPublicIds={value.map((v) => v.publicId || "").filter(Boolean)}
          onClose={() => setPickerOpen(false)}
          onConfirm={addFromLibrary}
        />
      )}
    </div>
  );
}
