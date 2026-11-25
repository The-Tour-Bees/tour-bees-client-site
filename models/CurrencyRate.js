import mongoose from "mongoose";

// How many BDT one unit of a currency is worth. BDT is the base and is never stored.
const currencyRateSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    bdtPerUnit: {
      type: Number,
      required: true,
      validate: { validator: (v) => Number.isFinite(v) && v > 0, message: "The rate must be greater than 0" },
    },
  },
  { timestamps: true },
);

export default mongoose.models.CurrencyRate ?? mongoose.model("CurrencyRate", currencyRateSchema);
