import { Schema, model, models, type InferSchemaType } from "mongoose";
import { BRIEFING_STATUS } from "@/types";

/**
 * Briefing de criação enviado pelo cliente pelo site.
 * Foco em criação de cardápios e acessórios em couro.
 */
const BriefingSchema = new Schema(
  {
    // contato
    responsible: { type: String, required: true },
    company: { type: String, required: true },
    whatsapp: String,
    email: { type: String, lowercase: true },
    instagram: String,
    city: String,
    // estabelecimento
    segment: String,
    style: String,
    audience: String,
    hasBranding: String,
    // projeto
    projectType: String,
    productTypes: [String],
    quantity: String,
    size: String,
    colorPreference: String,
    finishes: [String],
    logoPosition: String,
    pages: String,
    languages: String,
    contentReady: String,
    // referências e prazo
    references: String,
    deadline: String,
    budget: String,
    notes: String,
    // controle
    status: { type: String, enum: BRIEFING_STATUS, default: "new", index: true },
    source: { type: String, default: "Briefing site" },
  },
  { timestamps: true }
);

export type BriefingDoc = InferSchemaType<typeof BriefingSchema>;
export const Briefing = models.Briefing || model("Briefing", BriefingSchema);
