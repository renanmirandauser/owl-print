import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Biblioteca de Imagens (banco central de mídia).
 * Cada imagem é enviada uma única vez ao Cloudinary e fica disponível
 * para ser reutilizada em qualquer produto (ou outros módulos).
 *
 * `publicId` é único: ao registrar a mesma imagem novamente (ex.: um upload
 * feito direto no produto), fazemos upsert e não criamos duplicata.
 */
const MediaImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, index: true },
    alt: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

export type MediaImageDoc = InferSchemaType<typeof MediaImageSchema>;
export const MediaImage =
  models.MediaImage || model("MediaImage", MediaImageSchema);
