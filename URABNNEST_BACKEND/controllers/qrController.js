/**
 * QR Code Visitor Pass System
 * Residents generate a pass → QR code → Security scans → Auto approved
 */
import crypto from "crypto";
import { Visitors } from "../models/visitors.model.js";
import { Resident } from "../models/residents.models.js";
import { sendNotification } from "../services/notificationService.js";

// POST /qr/generate — Resident generates a visitor pass with QR
export const generateVisitorPass = async (req, res) => {
  try {
    const residentId = req.user.id;
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

    const { fullName, phone, visitorFor, purpose, expectedDate } = req.body;
    if (!fullName || !phone || !visitorFor) {
      return res.status(400).json({ success: false, message: "Name, phone and visitor purpose are required" });
    }

    // Generate unique QR token
    const qrToken = crypto.randomBytes(20).toString("hex");

    // Token valid for 24 hours from expectedDate (or now)
    const baseDate = expectedDate ? new Date(expectedDate) : new Date();
    const qrExpiresAt = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);

    // Create visitor entry with PENDING status
    const visitor = await Visitors.create({
      fullName,
      phone,
      visitorFor,
      purpose: purpose || "General Visit",
      resident: residentId,
      flatNo: resident.flatNo,
      block: resident.block,
      qrToken,
      qrExpiresAt,
      status: "APPROVED", // Pre-approved by resident
      approvalMethod: "QR",
    });

    // Return the token — frontend will render this as QR using QRCode.js
    return res.status(201).json({
      success: true,
      message: "Visitor pass generated successfully",
      pass: {
        visitorId: visitor._id,
        qrToken,
        qrExpiresAt,
        visitorName: fullName,
        flatNo: resident.flatNo,
        block: resident.block,
        residentName: resident.fullName,
        purpose: purpose || "General Visit",
      },
    });
  } catch (error) {
    console.error("generateVisitorPass error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// POST /qr/scan — Guard scans the QR token and checks in the visitor
export const scanQRAndCheckIn = async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ success: false, message: "QR token is required" });

    const visitor = await Visitors.findOne({ qrToken }).populate("resident", "fullName flatNo block email");

    if (!visitor) {
      return res.status(404).json({ success: false, message: "Invalid QR code — no matching visitor pass" });
    }

    // Check expiry
    if (visitor.qrExpiresAt && new Date() > visitor.qrExpiresAt) {
      await Visitors.findByIdAndUpdate(visitor._id, { status: "EXPIRED" });
      return res.status(400).json({ success: false, message: "This visitor pass has expired" });
    }

    if (visitor.status === "CHECKED_IN") {
      return res.status(400).json({ success: false, message: "Visitor already checked in" });
    }

    if (visitor.status === "CHECKED_OUT") {
      return res.status(400).json({ success: false, message: "Visitor has already exited" });
    }

    if (visitor.status === "REJECTED" || visitor.status === "EXPIRED") {
      return res.status(400).json({ success: false, message: `Visitor pass is ${visitor.status}` });
    }

    // Mark as checked in
    visitor.status = "CHECKED_IN";
    visitor.entryTime = new Date().toISOString();
    await visitor.save();

    // Notify resident via Socket.IO
    const io = req.app.get("io");
    if (visitor.resident) {
      await sendNotification(io, visitor.resident._id, {
        title: "Visitor Arrived 🔔",
        message: `${visitor.fullName} has entered via QR pass at Gate.`,
        type: "VISITOR",
        metadata: { visitorId: visitor._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "QR verified — visitor checked in",
      visitor: {
        name: visitor.fullName,
        phone: visitor.phone,
        flatNo: visitor.flatNo,
        block: visitor.block,
        residentName: visitor.resident?.fullName,
        entryTime: visitor.entryTime,
        purpose: visitor.purpose,
      },
    });
  } catch (error) {
    console.error("scanQRAndCheckIn error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// GET /qr/my-passes — Resident views all their generated passes
export const getMyVisitorPasses = async (req, res) => {
  try {
    const residentId = req.user.id;
    const passes = await Visitors.find({ resident: residentId, approvalMethod: "QR" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, passes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
