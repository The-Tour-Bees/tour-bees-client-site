import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, required: true, enum: ["login", "reset"] },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    usedAt: { type: Date, default: null },
    // MongoDB removes the document once this time has passed.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export default mongoose.models.Otp ?? mongoose.model("Otp", otpSchema);
