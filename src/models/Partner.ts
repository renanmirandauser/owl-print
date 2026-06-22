import { Schema, model, models, type InferSchemaType } from "mongoose";

const PartnerSchema = new Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, required: true },
    publicId: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type PartnerDoc = InferSchemaType<typeof PartnerSchema>;
export const Partner = models.Partner || model("Partner", PartnerSchema);
