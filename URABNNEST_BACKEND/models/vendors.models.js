import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      
    },
    email: {
      type: String,
      required: false,
      match: /.+\@.+\..+/,
    },
    address: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    addedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      
    },
    documents: [
      {
        type: String, // links or filenames of uploaded verification docs
      },
    ],
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const Vendors = mongoose.model("vendor", vendorSchema);
export { Vendors };
