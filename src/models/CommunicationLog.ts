import { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Registro de UMA mensagem enviada (histórico/auditoria).
 * Atualizado pelos webhooks da Z-API conforme o status muda.
 */
const CommunicationLogSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client" }, // se veio do CRM
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" }, // se foi campanha
    templateName: String,

    phone: { type: String, index: true }, // telefone normalizado (55...)
    contactName: String,
    message: String, // corpo já renderizado

    // ID que a Z-API devolve — usado para casar com o webhook de status.
    messageId: { type: String, index: true },
    zaapId: String,

    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "read", "failed"],
      default: "queued",
      index: true,
    },
    error: String,
  },
  { timestamps: true }
);

export type CommunicationLogDoc = InferSchemaType<typeof CommunicationLogSchema>;
export const CommunicationLog =
  models.CommunicationLog || model("CommunicationLog", CommunicationLogSchema);
