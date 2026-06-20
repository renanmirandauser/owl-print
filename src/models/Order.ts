import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ORDER_STAGE } from "@/types";

const OrderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    code: { type: String, required: true, unique: true }, // PED-00018
    quote: { type: Schema.Types.ObjectId, ref: "Quote", index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", index: true },
    clientName: { type: String, required: true },
    items: [OrderItemSchema], // snapshot do orçamento no momento da geração
    stage: { type: String, enum: ORDER_STAGE, default: "waiting_approval", index: true },
    total: { type: Number, default: 0 },
    deliveryForecast: Date,
    internalNotes: String,
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;
export const Order = models.Order || model("Order", OrderSchema);
