import express from "express";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import {
  generateVisitorPass,
  scanQRAndCheckIn,
  getMyVisitorPasses,
} from "../controllers/qrController.js";

const qrRoutes = express.Router();

// Resident: generate a QR visitor pass
qrRoutes.post("/generate", verifier, generateVisitorPass);
// Guard: scan a QR token and check in the visitor
qrRoutes.post("/scan", verifier, scanQRAndCheckIn);
// Resident: see their own generated passes
qrRoutes.get("/my-passes", verifier, getMyVisitorPasses);

export { qrRoutes };
