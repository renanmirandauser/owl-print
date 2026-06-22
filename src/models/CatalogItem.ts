import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Lista gerenciável do catálogo: categorias, cores, couros e tamanhos.
 * Tudo numa coleção só, separado por "kind".
 *   - category : categorias de produto (ex.: Cardápios, Cartas de Vinho)
 *   - color    : paleta de cores (ex.: Marrom #5C3D2E)
 *   - leather  : tipos de couro (ex.: Couro Sintético)
 *   - size     : tamanhos (ex.: A4, A5)
 */
const CatalogItemSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["category", "color", "leather", "size"],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    hex: { type: String }, // usado apenas por cores (opcional)
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type CatalogItemDoc = InferSchemaType<typeof CatalogItemSchema>;
export const CatalogItem =
  models.CatalogItem || model("CatalogItem", CatalogItemSchema);
