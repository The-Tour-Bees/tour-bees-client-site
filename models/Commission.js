import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    percent: { type: Number, required: true }, // the agent's rate when the booking was made
    amountBdt: { type: Number, required: true },
    status: { type: String, enum: ["due", "paid", "cancelled"], default: "due", index: true },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.Commission ?? mongoose.model("Commission", commissionSchema);
