import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  initiateRefund,
  downloadReceipt,
} from "../controllersResident/payment.controller.js";
import { verifier } from "../middlewares/verifyCookie.middleware.js";

const paymentRoutes = express.Router();

// Create a payment order
paymentRoutes.post("/create-order", verifier, createPaymentOrder);

// Verify payment after dummy transaction
paymentRoutes.post("/verify-payment", verifier, verifyPayment);

// Get all payments for a resident
paymentRoutes.get("/history", verifier, getPaymentHistory);

// Get single payment details
paymentRoutes.get("/:paymentId", verifier, getPaymentDetails);

// Initiate refund for a payment
paymentRoutes.post("/refund/:paymentId", verifier, initiateRefund);

// Download payment receipt
paymentRoutes.get("/receipt/:paymentId", verifier, downloadReceipt);

export { paymentRoutes };