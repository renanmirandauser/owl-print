import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Campanha de envio em massa.
 * - target: como os destinatários foram escolhidos (status do lead ou números avulsos).
 * - counters: totais atualizados durante/depois do envio.
 * - scheduledFor: se preenchido, é um agendamento (status "scheduled").
 */
const CampaignSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
    templateName: String, // cópia para exibição rápida

    // Segmentação: por status de lead OU lista de números avulsos.
    targetStatus: String, // ex.: "new", "won"... (de LEAD_STATUS) — opcional
    manualPhones: [String], // alternativa: números digitados — opcional

    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "done", "failed"],
      default: "draft",
      index: true,
    },
    scheduledFor: Date,
    createdBy: String,
  },
  { timestamps: true }
);

export type CampaignDoc = InferSchemaType<typeof CampaignSchema>;
export const Campaign = models.Campaign || model("Campaign", CampaignSchema);
