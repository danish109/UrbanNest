import express from "express";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import {
  getDashboardStats,
  getSecurityStats,
  getResidentDashboard,
} from "../controllers/analyticsController.js";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/dashboard", verifier, getDashboardStats);        // Admin
analyticsRoutes.get("/security", verifier, getSecurityStats);          // Guard
analyticsRoutes.get("/resident", verifier, getResidentDashboard);      // Resident

export { analyticsRoutes };
