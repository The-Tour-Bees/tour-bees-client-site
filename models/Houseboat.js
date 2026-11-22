import mongoose from "mongoose";

const houseboatSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    cabins: { type: Number, min: 1 },
    capacity: { type: Number, min: 1 },
    dayTrip: { type: Boolean, default: false },
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

export default mongoose.models.Houseboat ?? mongoose.model("Houseboat", houseboatSchema);
