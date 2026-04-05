import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "billables",
      required: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resident",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "bank_transfer", "cash"],
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    receiptUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    refundDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payments", paymentSchema);
export { Payment };