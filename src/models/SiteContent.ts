import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Conteúdo editável do site, por chave (ex.: "loja").
 * O campo "data" guarda um objeto livre com os textos.
 */
const SiteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type SiteContentDoc = InferSchemaType<typeof SiteContentSchema>;
export const SiteContent =
  models.SiteContent || model("SiteContent", SiteContentSchema);
