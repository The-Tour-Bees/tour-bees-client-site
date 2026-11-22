import { connectDb, hasDatabase } from "./db";

// Content comes from MongoDB when it is configured, otherwise from the static files in lib/data.
// A database that cannot be reached shows no content rather than an error page.
export async function loadContent(Model, fallback) {
  if (!hasDatabase()) return fallback;
  try {
    await connectDb();
    const docs = await Model.find({ published: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return docs.map(({ _id, __v, createdAt, updatedAt, demo, published, sortOrder, ...rest }) => ({ id: String(_id), ...rest }));
  } catch (err) {
    console.error("Could not load content:", err.message);
    return [];
  }
}
