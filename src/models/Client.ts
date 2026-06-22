import { Schema, model, models, type InferSchemaType } from "mongoose";
import { LEAD_STATUS } from "@/types";

// Timeline de atividades (histórico do lead)
const ActivitySchema = new Schema(
  {
    type: { type: String, default: "note" }, // note | call | email | whatsapp | status
    content: String,
    createdBy: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    company: String,
    phone: String,
    whatsapp: String,
    instagram: String,
    email: { type: String, lowercase: true },
    notes: String,
    status: { type: String, enum: LEAD_STATUS, default: "new", index: true },
    source: String, // origem do lead (form, instagram, indicação...)
    activities: [ActivitySchema],
    ownerId: String, // vendedor responsável (User.auth0Id)
  },
  { timestamps: true }
);

export type ClientDoc = InferSchemaType<typeof ClientSchema>;
export const Client = models.Client || model("Client", ClientSchema);
