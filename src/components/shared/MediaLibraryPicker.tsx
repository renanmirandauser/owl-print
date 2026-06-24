"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Search, X, Check, Loader2, ImageOff } from "lucide-react";
import { listMedia, type MediaDTO } from "@/actions/media";
import type { CloudinaryImage } from "@/types";

interface Props {
  /** publicIds já presentes na galeria — aparecem marcados e não são re-adicionados. */
  existingPublicIds?: string[];
  onClose: () => void;
  onConfirm: (images: CloudinaryImage[]) => void;
}

export function MediaLibraryPicker({
  existingPublicIds = [],
  onClose,
  onConfirm,
}: Props) {
  const [items, setItems] = useState<MediaDTO[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, MediaDTO>>({});
  const [loading, startLoad] = useTransition();

  const existing = new Set(existingPublicIds.filter(Boolean));

  function load(term: string) {
    startLoad(async () => {
      const data = await listMedia(term);
      setItems(data);
    });
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(item: MediaDTO) {
    if (item.publicId && existing.has(item.publicId)) return; // já está na galeria
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });
  }

  function confirm() {
    const imgs: CloudinaryImage[] = Object.values(selected).map((m) => ({
      url: m.url,
      publicId: m.publicId,
      alt: m.alt || undefined,
    }));
    onConfirm(imgs);
  }

  const count = Object.keys(selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />

      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-premium">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-leather/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-leather">
            Biblioteca de Imagens
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1 text-ink/50 transition-colors hover:bg-leather/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="border-b border-leather/10 px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(search);
              }}
              placeholder="Buscar por descrição ou etiqueta e pressione Enter…"
              className="w-full rounded-lg border border-leather/15 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/25"
            />
          </div>
        </div>

        {/* Grade */}
        <div className="min-h-[200px] flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-ink/40">
              <Loader2 className="h-6 w-6 animate-spin text-champagne" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-ink/40">
              <ImageOff className="h-7 w-7" />
              <p className="text-sm">
                {search
                  ? "Nenhuma imagem encontrada para essa busca."
                  : "A biblioteca está vazia. Envie imagens na página Biblioteca."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((m) => {
                const already = !!(m.publicId && existing.has(m.publicId));
                const isSel = !!selected[m.id];
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggle(m)}
                    disabled={already}
                    title={m.alt || ""}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      already
                        ? "cursor-not-allowed border-emerald-300 opacity-60"
                        : isSel
                        ? "border-champagne ring-2 ring-champagne/30"
                        : "border-transparent hover:border-champagne/50"
                    }`}
                  >
                    <Image
                      src={m.url}
                      alt={m.alt || ""}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    {(isSel || already) && (
                      <span
                        className={`absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-white shadow ${
                          already ? "bg-emerald-500" : "bg-champagne"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {already && (
                      <span className="absolute inset-x-0 bottom-0 bg-emerald-600/85 py-0.5 text-center text-[10px] font-semibold text-white">
                        Já na galeria
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-leather/10 px-5 py-4">
          <span className="text-sm text-ink/55">
            {count > 0 ? `${count} selecionada(s)` : "Selecione as imagens"}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-leather/5 hover:text-ink"
            >
              Cancelar
            </button>
            <button
              onClick={confirm}
              disabled={count === 0}
              className="btn-gold !py-2 disabled:opacity-50"
            >
              Adicionar {count > 0 ? `(${count})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
