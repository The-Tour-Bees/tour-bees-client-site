import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    accountType: { type: String, required: true, enum: ["host", "agent", "member", "admin"], index: true },
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    mustChangePassword: { type: Boolean, default: true },
    // True once the person has proved they own the mobile number with a one-time code.
    contactVerified: { type: Boolean, default: false },

    bloodGroup: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" }, // YYYY-MM-DD
    nidNumber: { type: String, default: "" },
    presentAddress: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },

    status: { type: String, enum: ["active", "inactive"], default: "inactive", index: true },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },

    agent: {
      commissionPercent: { type: Number, min: 0, max: 100 },
      payoutNumber: { type: String, default: "" }, // bKash / Nagad
    },
    member: {
      tier: { type: String, enum: ["regular", "vip"], default: "regular" },
      expiresAt: { type: String, default: "" }, // YYYY-MM-DD
    },

    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    demo: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default mongoose.models.User ?? mongoose.model("User", userSchema);
