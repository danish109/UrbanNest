import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    flatNo: {
      type: String,
      required: true,
      trim: true,
    },
    block: {
      type: String,
      required: true,
      trim: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      // "2025-06" format — used to prevent duplicate bills per flat per month
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["UNPAID", "PAID", "OVERDUE", "WAIVED"],
      default: "UNPAID",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "ONLINE", null],
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
    generatedBy: {
      // Admin id who generated the bill
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate bill for same flat+block+month
maintenanceSchema.index({ flatNo: 1, block: 1, month: 1 }, { unique: true });

export const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
