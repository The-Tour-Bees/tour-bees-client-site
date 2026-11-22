import mongoose from "mongoose";

const STATUSES = ["new", "contacted", "confirmed", "closed", "cancelled"];

const enquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["contact", "vip", "investor", "event", "custom_trip", "hotel", "houseboat"],
      index: true,
    },
    contact: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, default: "" },
    },
    // Everything specific to the enquiry type (dates, guests, product slug, message...).
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: STATUSES, default: "new", index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.models.Enquiry ?? mongoose.model("Enquiry", enquirySchema);
