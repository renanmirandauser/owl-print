import { Schema, model, models, type InferSchemaType } from "mongoose";
import { SEGMENTS } from "@/types";

const ImageSchema = new Schema(
  { url: { type: String, required: true }, publicId: String, alt: String },
  { _id: false }
);

const PortfolioSchema = new Schema(
  {
    clientName: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    segment: { type: String, enum: SEGMENTS, index: true },
    category: String,
    description: String,
    caseStudy: String,
    images: [ImageSchema],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type PortfolioDoc = InferSchemaType<typeof PortfolioSchema>;
export const Portfolio = models.Portfolio || model("Portfolio", PortfolioSchema);
