import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ROLES } from "@/types";

const UserSchema = new Schema(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    picture: String,
    role: { type: String, enum: ROLES, default: "sales", index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User = models.User || model("User", UserSchema);
