import mongoose from "mongoose";

// Reuse one connection across hot reloads and serverless invocations.
const cache = (globalThis.__mongoose ??= { conn: null, promise: null });

export const hasDatabase = () => Boolean(process.env.MONGODB_URI);

export async function connectDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose
    .connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    })
    .then((m) => m)
    .catch((err) => {
      cache.promise = null;
      throw err;
    });

  cache.conn = await cache.promise;
  return cache.conn;
}
