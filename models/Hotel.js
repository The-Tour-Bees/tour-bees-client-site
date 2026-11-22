import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["hotel", "resort"] },
    place: { type: String, required: true, trim: true },
    stars: { type: Number, min: 1, max: 5 },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    basePriceBdt: { type: Number, required: true, min: 0 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    demo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.Hotel ?? mongoose.model("Hotel", hotelSchema);
