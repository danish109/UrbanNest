import mongoose, { Schema } from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    visitorFor: { type: String, required: true },
    purpose: { type: String, default: "General Visit" },
    resident: { type: Schema.Types.ObjectId, ref: "Resident" },
    flatNo: { type: String, required: true },
    block: { type: String, required: true },
    entryTime: { type: String },
    exitTime: { type: String },
    photo: {
      public_id: { type: String },
      url: { type: String },
    },
    qrCode: { type: String },
    qrToken: { type: String, unique: true, sparse: true },
    qrExpiresAt: { type: Date },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CHECKED_IN", "CHECKED_OUT", "EXPIRED"],
      default: "PENDING",
    },
    approvalMethod: {
      type: String,
      enum: ["QR", "MANUAL", "DIRECT"],
      default: "DIRECT",
    },
    vehicleDetails: [
      {
        type: { type: String },
        model: { type: String },
        color: { type: String },
        registrationNumber: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Visitors = mongoose.model("visitorsdata", visitorSchema);
export { Visitors };
