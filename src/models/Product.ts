import { Schema, model, models, type InferSchemaType } from "mongoose";

const ImageSchema = new Schema(
  { url: { type: String, required: true }, publicId: String, alt: String },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    sizes: [String],
    colors: [String],
    finishes: [String],
    leathers: [String],
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
