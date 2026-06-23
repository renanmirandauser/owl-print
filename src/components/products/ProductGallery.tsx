"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { CloudinaryImage } from "@/types";

export function ProductGallery({ images, name }: { images: CloudinaryImage[]; name: string }) {
  const [main, setMain] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-cream text-6xl text-premium/30">🦉</div>
    );
  }

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }
  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }

  const current = images[main];

  return (
    <>
      {/* Imagem principal (clicável) */}
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-cream shadow-soft"
        onClick={() => setLightbox(main)}
      >
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority
        />
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-ink/50 px-2 py-0.5 text-xs text-white">
            {main + 1} / {images.length}
          </span>
        )}
      </div>
      {current.alt && (
        <p className="mt-2 text-center text-sm text-ink/55 italic">{current.alt}</p>
      )}

      {/* Miniaturas (todas, com scroll) */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMain(i)}
              className={
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all " +
                (i === main ? "border-champagne shadow-md" : "border-transparent opacity-60 hover:opacity-100")
              }
            >
              <Image src={img.url} alt={img.alt || `${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="max-h-[90vh] max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[80vh] overflow-hidden rounded-xl">
              <Image
                src={images[lightbox].url}
                alt={images[lightbox].alt || name}
                width={1200}
                height={900}
                className="h-full max-h-[80vh] w-full object-contain"
              />
            </div>
            {images[lightbox].alt && (
              <p className="mt-3 text-center text-sm text-white/70 italic">{images[lightbox].alt}</p>
            )}
            {images.length > 1 && (
              <p className="mt-2 text-center text-xs text-white/40">
                {lightbox + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
