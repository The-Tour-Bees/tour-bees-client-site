import { connectDb, hasDatabase } from "./db";
import Enquiry from "../models/Enquiry";

export class EnquiryStorageUnavailable extends Error {}

// Saves a validated enquiry. TODO: also email the team and the guest (master_plan.md section 5.3).
export async function saveEnquiry(data) {
  if (!hasDatabase()) throw new EnquiryStorageUnavailable("MONGODB_URI is not set");

  const { type, name, mobile, email, ...payload } = data;

  try {
    await connectDb();
    const doc = await Enquiry.create({ type, contact: { name, mobile, email }, payload });
    return { id: String(doc._id) };
  } catch (err) {
    // A database that cannot be reached is "unavailable", not a bug in the request.
    if (err?.name === "MongooseServerSelectionError" || err?.name === "MongoNetworkError") {
      throw new EnquiryStorageUnavailable(err.message);
    }
    throw err;
  }
}
