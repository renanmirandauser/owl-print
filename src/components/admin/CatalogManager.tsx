"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  createCatalogItem,
  deleteCatalogItem,
  type CatalogItemDTO,
  type CatalogKind,
} from "@/actions/catalog";

export function CatalogManager({
  kind,
  title,
  description,
  items,
  withColor = false,
  placeholder = "Novo item...",
}: {
  kind: CatalogKind;
  title: string;
  description?: string;
  items: CatalogItemDTO[];
  withColor?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#5C3D2E");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function add() {
    const value = name.trim();
    if (!value) return;
    setError("");
    startTransition(async () => {
      const res = await createCatalogItem({ kind, name: value, hex: withColor ? hex : undefined });
      if (res.ok) {
        setName("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteCatalogItem(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-leather/10 bg-white p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold text-leather">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink/50">{description}</p>}

      {/* lista atual */}
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length === 0 && (
          <p className="text-sm text-ink/40">Nenhum item ainda. Adicione abaixo.</p>
        )}
        {items.map((it) => (
          <span
            key={it.id}
            className="inline-flex items-center gap-2 rounded-full border border-leather/15 bg-cream px-3 py-1.5 text-sm text-ink"
          >
            {withColor && (
              <span
                className="h-4 w-4 rounded-full border border-leather/20"
                style={{ backgroundColor: it.hex || "#ccc" }}
              />
            )}
            {it.name}
            <button
              onClick={() => remove(it.id)}
              disabled={pending}
              aria-label={`Excluir ${it.name}`}
              className="text-ink/40 transition-colors hover:text-burgundy"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>

      {/* adicionar novo */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-leather/10 pt-4">
        {withColor && (
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-leather/15 bg-white p-1"
            aria-label="Cor"
          />
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          maxLength={60}
          className="min-w-[160px] flex-1 rounded-lg border border-leather/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-champagne"
        />
        <button onClick={add} disabled={pending} className="btn-gold !py-2 !px-4 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
    </div>
  );
}
