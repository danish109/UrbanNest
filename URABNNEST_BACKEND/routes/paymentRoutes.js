import express from "express";
import {
  processPayment,
  updateServiceStatus,
  getBillableById,
} from "../controllerpayments/paymentController.js";

const paymentrouter = express.Router();

// Payment routes
paymentrouter.post("/processPayment/:id", processPayment);
paymentrouter.put("/updateStatus/:id", updateServiceStatus);
paymentrouter.get("/getBillable/:id", getBillableById);

export default paymentrouter;
