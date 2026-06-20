import { Schema, model, models, type InferSchemaType } from "mongoose";
import { QUOTE_STATUS } from "@/types";

const QuoteItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    get subtotal() {
      return (this as { quantity: number; unitPrice: number }).quantity *
        (this as { quantity: number; unitPrice: number }).unitPrice;
    },
  },
  { _id: false, toJSON: { getters: true } }
);

const QuoteSchema = new Schema(
  {
    code: { type: String, required: true, unique: true }, // ex: ORC-00035
    // Link opcional ao CRM; o orçamento funciona apenas com clientName.
    client: { type: Schema.Types.ObjectId, ref: "Client", index: true },
    clientName: { type: String, required: true },
    clientPhone: String, // usado no envio por WhatsApp
    clientEmail: String, // usado no envio por e-mail
    items: [QuoteItemSchema],
    total: { type: Number, default: 0 },
    status: { type: String, enum: QUOTE_STATUS, default: "draft", index: true },
    validUntil: Date,
    notes: String,
    createdBy: String,
  },
  { timestamps: true }
);

// Recalcula total antes de salvar
QuoteSchema.pre("save", function (next) {
  const items = (this.items ?? []) as Array<{ quantity: number; unitPrice: number }>;
  this.total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  next();
});

export type QuoteDoc = InferSchemaType<typeof QuoteSchema>;
export const Quote = models.Quote || model("Quote", QuoteSchema);
