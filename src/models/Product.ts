import { Schema, model, models, type InferSchemaType } from "mongoose";
import { PRODUCT_CATEGORIES } from "@/types";

const ImageSchema = new Schema(
  { url: { type: String, required: true }, publicId: String, alt: String },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    description: { type: String, default: "" },
    sizes: [String],
    colors: [String],
    finishes: [String],
    featured: { type: Boolean, default: false, index: true },
    gallery: [ImageSchema],
    active: { type: Boolean, default: true },
    // SEO
    seoTitle: String,
    seoDescription: String,
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export const Product = models.Product || model("Product", ProductSchema);
