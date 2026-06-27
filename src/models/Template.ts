import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Modelo de mensagem (template) reutilizável em campanhas e envios individuais.
 * Variáveis suportadas no corpo: {{nome}}, {{empresa}}, {{numero}}.
 */
const TemplateSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    body: { type: String, required: true },
    // "ativo" no fluxo Z-API equivale ao "aprovado" do fluxo Meta.
    active: { type: Boolean, default: true },
    createdBy: String, // User.auth0Id
  },
  { timestamps: true }
);

export type TemplateDoc = InferSchemaType<typeof TemplateSchema>;
export const Template = models.Template || model("Template", TemplateSchema);
