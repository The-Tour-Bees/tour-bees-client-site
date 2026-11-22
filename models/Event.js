import mongoose from "mongoose";
import "./User"; // registers the User model that hostId points to (needed for populate)

const eventSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, required: true, trim: true },
    place: { type: String, default: "", trim: true }, // used by the place filter
    startsOn: { type: String, required: true }, // YYYY-MM-DD
    endsOn: { type: String, default: "" },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    basePriceBdt: { type: Number, required: true, min: 0 },
    seats: { type: Number, min: 0 },
    seatsLeft: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    itinerary: { type: [{ title: String, text: String, _id: false }], default: [] },
    published: { type: Boolean, default: true },
    demo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

eventSchema.index({ startsOn: 1, endsOn: 1 });

export default mongoose.models.Event ?? mongoose.model("Event", eventSchema);
