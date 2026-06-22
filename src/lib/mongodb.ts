import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Defina MONGODB_URI no .env.local");

// Cache global evita múltiplas conexões em ambiente serverless (Vercel).
type Cache = { conn: Mongoose | null; promise: Promise<Mongoose> | null };
const globalForMongoose = global as unknown as { mongoose?: Cache };
const cached: Cache = globalForMongoose.mongoose ?? { conn: null, promise: null };
globalForMongoose.mongoose = cached;

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
