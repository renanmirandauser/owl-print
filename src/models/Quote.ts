import { Schema, model, models, type InferSchemaType } from "mongoose";
import { QUOTE_STATUS } from "@/types";

const QuoteItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

QuoteItemSchema.virtual("subtotal").get(function (this: { quantity: number; unitPrice: number }) {
  return this.quantity * this.unitPrice;
});

/* ─── Sistema de Vendas OWL PRINT (OS embutida no orçamento) ─────
   Estrutura idêntica ao SISTEMA_DE_VENDAS_OWL_PRINT.html:
   modo (PROD/CRIACAO/ALTERACAO), dados do pedido, seções marcadas,
   detalhes (todos os selects/campos), briefing e mockups (Cloudinary). */

const OsMockupSchema = new Schema(
  {
    key: { type: String, required: true }, // c1, c2, i1, i2, j1, j2, p1, p2, d1, d2
    url: { type: String, required: true },
    publicId: String,
  },
  { _id: false }
);

const VendasSchema = new Schema(
  {
    modo: { type: String, enum: ["PROD", "CRIACAO", "ALTERACAO"], default: "PROD" },
    nPedido: String,
    vendedor: String,
    entrega: String,
    prioridade: String,
    dtEntrada: String, // yyyy-mm-dd (string para evitar problemas de fuso)
    dtLimite: String,
    inauguracao: String,
    secoes: {
      cardapio: { type: Boolean, default: false },
      impressao: { type: Boolean, default: false },
      ja: { type: Boolean, default: false },
      pc: { type: Boolean, default: false },
      display: { type: Boolean, default: false },
    },
    detalhes: { type: Schema.Types.Mixed, default: {} }, // cTipo, cQtdPed, jFormato, pcMat, dCor, ...
    briefing: { type: Schema.Types.Mixed }, // briefing de criação OU alteração
    mockups: { type: [OsMockupSchema], default: [] },
    driveLink: String,
  },
  { _id: false }
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
    vendas: { type: VendasSchema, default: undefined }, // OS do Sistema de Vendas
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
