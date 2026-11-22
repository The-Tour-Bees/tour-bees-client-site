import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true },
    product: {
      type: { type: String, enum: ["event", "other"], required: true },
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
      title: { type: String, required: true },
    },
    guest: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, default: "" },
    },
    travellers: { type: Number, required: true, min: 1 },
    amountBdt: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByRole: { type: String, required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  },
  { timestamps: true },
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ "guest.mobile": 1 });
bookingSchema.index({ "guest.email": 1 });

export default mongoose.models.Booking ?? mongoose.model("Booking", bookingSchema);
