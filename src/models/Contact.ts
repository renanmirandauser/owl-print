import { Schema, model, models, type InferSchemaType } from "mongoose";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    message: String,
    handled: { type: Boolean, default: false },
    source: String,
  },
  { timestamps: true }
);

export type ContactDoc = InferSchemaType<typeof ContactSchema>;
export const Contact = models.Contact || model("Contact", ContactSchema);
