"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Star } from "lucide-react";
import type { CloudinaryImage } from "@/types";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface Props {
  value: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
}

/**
 * Upload direto (unsigned) para o Cloudinary. A primeira imagem é a principal.
 * Requer NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
 */
export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!CLOUD || !PRESET) {
      setError("Configure as variáveis do Cloudinary no .env.local.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded: CloudinaryImage[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("upload");
        const data = await res.json();
        uploaded.push({ url: data.secure_url, publicId: data.public_id });
      }
      onChange([...value, ...uploaded]);
    } catch {
      setError("Falha no upload de uma ou mais imagens.");
    } finally {
      setUploading(false);
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function makeMain(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [img] = next.splice(i, 1);
    onChange([img, ...next]);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((img, i) => (
          <div key={img.publicId || i} className="group relative aspect-square overflow-hidden rounded-lg border border-premium/15">
            <Image src={img.url} alt={img.alt || ""} fill sizes="120px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-champagne px-1.5 py-0.5 text-[10px] font-medium text-leather">
                <Star className="h-3 w-3" /> Principal
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-leather/50 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 && (
                <button type="button" onClick={() => makeMain(i)} title="Tornar principal" className="rounded bg-white/90 p-1">
                  <Star className="h-4 w-4 text-leather" />
                </button>
              )}
              <button type="button" onClick={() => remove(i)} title="Remover" className="rounded bg-white/90 p-1">
                <X className="h-4 w-4 text-burgundy" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-premium/30 text-leather/50 hover:border-champagne hover:text-champagne">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs">{uploading ? "Enviando..." : "Adicionar"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-burgundy">{error}</p>}
    </div>
  );
}
