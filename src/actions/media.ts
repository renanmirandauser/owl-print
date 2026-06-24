"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { MediaImage } from "@/models/MediaImage";

export interface MediaDTO {
  id: string;
  url: string;
  publicId?: string;
  alt: string;
  tags: string[];
}

type Result = { ok: true } | { ok: false; error: string };

interface LeanMedia {
  _id: unknown;
  url: string;
  publicId?: string;
  alt?: string;
  tags?: string[];
}

function serialize(d: LeanMedia): MediaDTO {
  return {
    id: String(d._id),
    url: d.url,
    publicId: d.publicId || undefined,
    alt: d.alt ?? "",
    tags: d.tags ?? [],
  };
}

const cleanTags = (tags?: string[]) =>
  Array.from(
    new Set(
      (tags ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );

/* ─── Leitura ───────────────────────────────────────────── */

/**
 * Lista a biblioteca. Aceita uma busca opcional por texto (no nome/alt)
 * ou por etiquetas (tags). Mais recentes primeiro.
 */
export async function listMedia(search?: string): Promise<MediaDTO[]> {
  try {
    await dbConnect();
    const q = (search ?? "").trim();
    const filter = q
      ? {
          $or: [
            { alt: { $regex: q, $options: "i" } },
            { tags: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    const docs = await MediaImage.find(filter)
      .sort({ createdAt: -1 })
      .lean<LeanMedia[]>();
    return docs.map(serialize);
  } catch (err) {
    console.error("listMedia:", err);
    return [];
  }
}

/* ─── Escrita ───────────────────────────────────────────── */

/**
 * Registra uma ou mais imagens na biblioteca.
 * Faz upsert por publicId: se a imagem já existir, não duplica.
 * Usado tanto pela página da Biblioteca quanto pelos uploads feitos
 * direto no produto (para o banco crescer sozinho).
 */
export async function registerMedia(
  images: { url: string; publicId?: string; alt?: string; tags?: string[] }[]
): Promise<Result> {
  try {
    await dbConnect();
    const valid = images.filter((i) => i.url);
    if (valid.length === 0) return { ok: false, error: "Nenhuma imagem válida." };

    for (const img of valid) {
      const tags = cleanTags(img.tags);
      if (img.publicId) {
        await MediaImage.findOneAndUpdate(
          { publicId: img.publicId },
          {
            $setOnInsert: { url: img.url },
            ...(img.alt ? { $set: { alt: img.alt } } : {}),
            ...(tags.length ? { $addToSet: { tags: { $each: tags } } } : {}),
          },
          { upsert: true, new: true }
        );
      } else {
        await MediaImage.create({ url: img.url, alt: img.alt ?? "", tags });
      }
    }

    revalidatePath("/admin/biblioteca");
    return { ok: true };
  } catch (err) {
    console.error("registerMedia:", err);
    return { ok: false, error: "Erro ao salvar na biblioteca." };
  }
}

export async function updateMedia(
  id: string,
  input: { alt?: string; tags?: string[] }
): Promise<Result> {
  try {
    await dbConnect();
    await MediaImage.findByIdAndUpdate(id, {
      alt: (input.alt ?? "").trim(),
      tags: cleanTags(input.tags),
    });
    revalidatePath("/admin/biblioteca");
    return { ok: true };
  } catch (err) {
    console.error("updateMedia:", err);
    return { ok: false, error: "Erro ao atualizar a imagem." };
  }
}

export async function deleteMedia(id: string): Promise<Result> {
  try {
    await dbConnect();
    await MediaImage.findByIdAndDelete(id);
    revalidatePath("/admin/biblioteca");
    return { ok: true };
  } catch (err) {
    console.error("deleteMedia:", err);
    return { ok: false, error: "Erro ao excluir a imagem." };
  }
}
