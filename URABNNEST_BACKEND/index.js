// ============================================================
//  NestMate Backend - Main Application Entry
// ============================================================
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Core routes
import { userRoutes } from "./routes/user.routes.js";
import { superAdminRoutes } from "./routes/superAdmin.route.js";
import { guardRoutes } from "./routes/guard.route.js";
import { residentRoute } from "./routes/residents.route.js";
import router from "./routes/aiRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import contactRoute from "./routes/contact.route.js";
import paymentrouter from "./routes/paymentRoutes.js";
import { paymentRoutes } from "./routes/payment.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import societyRoutes from "./routes/societyRoutes.js"

// ✅ NEW Feature Routes
import { notificationRoutes } from "./routes/notification.routes.js";
import { qrRoutes } from "./routes/qr.routes.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";

// Services & middleware
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { verifier } from "./middlewares/verifyCookie.middleware.js";

dotenv.config();

const app = express();
const uri = process.env.MONGO_URI;

// MongoDB connection
mongoose
  .connect(uri, {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// REPLACE with this
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Make Socket.IO instance accessible in all controllers via req.io
app.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SEC,
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "NestMate server is running",
    version: "2.0.0",
    features: [
      "Real-time Socket.IO notifications",
      "QR Visitor Pass System",
      "Face Capture for Visitors",
      "Enhanced Complaint Management",
      "Resident Profile System",
      "Analytics Dashboard",
      "Email Automation",
      "Announcement Broadcasting",
    ],
  });
});

// ─── API Routes ───────────────────────────────────────────────

// Auth & core
app.use("/user", userRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/guard", guardRoutes);
app.use("/resident", residentRoute);
app.use("/ai", router);
app.use("/api/vehicles", vehicleRoutes);
app.use("/payment", paymentrouter);
app.use("/payment1", paymentRoutes);
app.use("/contact", contactRoute);
app.use("/chat", chatRoutes);
app.use("/society", societyRoutes);

// ✅ NEW Feature Routes
app.use("/notifications", notificationRoutes);   // Real-time notification system
app.use("/qr", qrRoutes);                        // QR Visitor Pass system
app.use("/profile", profileRoutes);             // Resident profile management
app.use("/analytics", analyticsRoutes);          // Dashboard analytics

// ─── Error Handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
