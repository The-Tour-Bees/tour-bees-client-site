import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    scope: { type: String, required: true, enum: ["domestic", "international"], index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    destination: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    basePriceBdt: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: { type: [{ title: String, text: String, _id: false }], default: [] },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    demo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.Trip ?? mongoose.model("Trip", tripSchema);
