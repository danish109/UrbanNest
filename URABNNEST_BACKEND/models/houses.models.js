import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    flatNo: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      required: true,
    },
    ownerStatus: {
      type: String,
      enum: ["SOLD", "RENTED", "VACCANT"],
      default: "VACCANT",
      required: true,
    },
    passkey: {
      type: String,
      default: null,
      required: true,
    },
    fullName: {
      type: String,
      default: null,
      required: true,
    },
    registry: {
      type: String,
      default: null,
      required: true,
    },
    phone: {
      type: String,
      default: null,
      required: true,
    },
    email: {
      type: String,
      default: null,
      required: true,
    },
    tenure: {
      type: String,
      default: null,
    },
    nominee: {
      type: String,
      default: null,
    },
    dateOfDeal: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const Houses = mongoose.model("houses", houseSchema);
export { Houses };
