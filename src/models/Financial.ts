import { Schema, model, models, type InferSchemaType } from "mongoose";
import { FINANCIAL_KIND } from "@/types";

const FinancialSchema = new Schema(
  {
    kind: { type: String, enum: FINANCIAL_KIND, required: true, index: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: String, // material, frete, salário, venda...
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export type FinancialDoc = InferSchemaType<typeof FinancialSchema>;
export const Financial = models.Financial || model("Financial", FinancialSchema);
