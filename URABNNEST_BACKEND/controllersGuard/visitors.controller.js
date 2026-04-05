import { Visitors } from "../models/visitors.model.js";
import { Resident } from "../models/residents.models.js";
import { Guard } from "../models/guardSignup.models.js";
import { sendNotification } from "../services/notificationService.js";
import { v2 as cloudinary } from "cloudinary";

// Add visitor with optional face capture photo
export const handleVisitorAdd = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Guard.findById(id);

    // if (!user) {
    //   return res.status(400).json({ success: false, message: "You are not found in our guards database" });
    // }
    // if (user.role !== "GUARD") {
    //   return res.status(403).json({ success: false, message: "Not authorized" });
    // }

    const { fullName, phone, visitorFor, vehicleDetails, flatNo, block, residentId, purpose } = req.body;
    if (!fullName || !phone || !visitorFor || !flatNo || !block || !residentId) {
      return res.status(400).json({ success: false, message: "All details are mandatory" });
    }

    const resident = await Resident.findById(residentId).select("-password");
    if (!resident) {
      return res.status(400).json({ success: false, message: "Resident doesn't exist" });
    }

    const visitorData = {
      fullName,
      phone,
      visitorFor,
      purpose: purpose || "General Visit",
      vehicleDetails,
      flatNo,
      block,
      status: "PENDING",
      approvalMethod: "MANUAL",
      resident: resident._id,
      entryTime: new Date().toISOString(),
    };

    // Handle face capture photo upload
    if (req.files?.photo) {
      const photo = req.files.photo;
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(photo.mimetype.toLowerCase())) {
        return res.status(400).json({ success: false, message: "Only PNG/JPEG/WEBP images allowed for photo" });
      }

      const uploadResult = await cloudinary.uploader.upload(photo.tempFilePath, {
        folder: "nestmate/visitors",
        transformation: [{ width: 600, height: 600, crop: "fill" }],
      });

      visitorData.photo = { public_id: uploadResult.public_id, url: uploadResult.secure_url };
      visitorData.status = "CHECKED_IN"; // Auto check-in when photo captured by guard
    }

    const result = await Visitors.create(visitorData);

    // Notify resident in real-time via Socket.IO
    const io = req.app.get("io");
    await sendNotification(io, resident._id, {
      title: "Visitor at Gate 🔔",
      message: `${fullName} is at the gate asking to visit you. Purpose: ${purpose || "General Visit"}`,
      type: "VISITOR",
      metadata: { visitorId: result._id, phone, flatNo, block },
      link: `/visitors/${result._id}`,
    });

    return res.status(200).json({ success: true, message: "Visitor saved and resident notified", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

// Update visitor exit time
export const markVisitorExit = async (req, res) => {
  try {
    const { id } = req.user;
    const { visitorId } = req.params;

    const user = await Guard.findById(id);
    if (!user) return res.status(400).json({ success: false, message: "Guard not found" });
    if (user.role !== "GUARD") return res.status(403).json({ success: false, message: "Not authorized" });

    const visitor = await Visitors.findById(visitorId);
    if (!visitor) return res.status(404).json({ success: false, message: "Visitor not found" });
    if (visitor.exitTime) return res.status(400).json({ success: false, message: "Exit already recorded" });

    visitor.exitTime = new Date().toISOString();
    visitor.status = "CHECKED_OUT";
    await visitor.save({ validateBeforeSave: false });

    // Notify resident about visitor exit
    if (visitor.resident) {
      const io = req.app.get("io");
      await sendNotification(io, visitor.resident, {
        title: "Visitor Left 👋",
        message: `${visitor.fullName} has exited your premises.`,
        type: "VISITOR",
        metadata: { visitorId: visitor._id },
      });
    }

    return res.status(200).json({ success: true, message: "Exit time updated", visitor });
  } catch (error) {
    console.error("Error updating exit time:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Guard approves a pending visitor manually
export const approveVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { action } = req.body;

    // 🔐 Get logged-in resident
    const residentId = req.user.id;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be APPROVE or REJECT",
      });
    }

    const visitor = await Visitors.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // 🔥 MAIN LOGIC: ONLY OWNER CAN APPROVE
    if (visitor.resident.toString() !== residentId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to approve this visitor",
      });
    }

    // 🚫 Prevent re-approval
    if (visitor.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Visitor already processed",
      });
    }

    // ✅ Update status
    visitor.status = action === "APPROVE" ? "APPROVED" : "REJECTED";

    await visitor.save({ validateBeforeSave: false });

    // 🔔 Notify Guard (instead of resident now)
    const io = req.app.get("io");

    const msg =
      action === "APPROVE"
        ? `${visitor.fullName} approved by resident`
        : `${visitor.fullName} rejected by resident`;

    io.to("guard").emit("visitorDecision", {
      visitorId: visitor._id,
      status: visitor.status,
      message: msg,
    });

    // 🔔 Optional: notification collection
    await sendNotification(io, visitor.resident, {
      title: "Visitor Decision Updated",
      message: msg,
      type: "VISITOR",
      metadata: { visitorId: visitor._id },
    });

    return res.status(200).json({
      success: true,
      message: `Visitor ${action.toLowerCase()}d successfully`,
      visitor,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all visitors (with optional filters)
export const getAllVisitor = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const visitors = await Visitors.find(filter)
      .populate("resident", "fullName flatNo block")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, visitors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch visitors" });
  }
};
// Add visitor by scanning resident's QR code
export const addVisitorByQR = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Guard.findById(id);

    if (!user) {
      return res.status(400).json({ success: false, message: "You are not found in our guards database" });
    }
   

    // QR payload contains residentId, flatNo, block (signed by resident)
    const { qrToken, fullName, phone, purpose, vehicleDetails } = req.body;

    if (!qrToken || !fullName || !phone) {
      return res.status(400).json({ success: false, message: "QR token, visitor name and phone are mandatory" });
    }

    // Decode & verify the QR token (JWT signed by resident)
    let qrPayload;
    try {
      qrPayload = jwt.verify(qrToken, process.env.QR_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ success: false, message: "QR code has expired. Ask resident to regenerate." });
      }
      return res.status(400).json({ success: false, message: "Invalid QR code" });
    }

    const { residentId, flatNo, block, visitorFor } = qrPayload;

    const resident = await Resident.findById(residentId).select("-password");
    if (!resident) {
      return res.status(400).json({ success: false, message: "Resident linked to this QR not found" });
    }

    // Optional: face capture photo upload (same as handleVisitorAdd)
    const visitorData = {
      fullName,
      phone,
      visitorFor: visitorFor || resident.fullName,
      purpose: purpose || "General Visit",
      vehicleDetails,
      flatNo,
      block,
      status: "CHECKED_IN",           // QR-verified → auto approve entry
      approvalMethod: "QR",
      resident: resident._id,
      entryTime: new Date().toISOString(),
    };

    if (req.files?.photo) {
      const photo = req.files.photo;
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(photo.mimetype.toLowerCase())) {
        return res.status(400).json({ success: false, message: "Only PNG/JPEG/WEBP images allowed for photo" });
      }

      const uploadResult = await cloudinary.uploader.upload(photo.tempFilePath, {
        folder: "Urbannest/visitors",
        transformation: [{ width: 600, height: 600, crop: "fill" }],
      });

      visitorData.photo = { public_id: uploadResult.public_id, url: uploadResult.secure_url };
    }

    const result = await Visitors.create(visitorData);

    // Notify resident about QR-verified entry
    const io = req.app.get("io");
    await sendNotification(io, resident._id, {
      title: "Visitor Entered via QR ✅",
      message: `${fullName} entered using your QR code. Purpose: ${purpose || "General Visit"}`,
      type: "VISITOR",
      metadata: { visitorId: result._id, phone, flatNo, block, approvalMethod: "QR_CODE" },
      link: `/visitors/${result._id}`,
    });

    return res.status(200).json({
      success: true,
      message: "Visitor checked in via QR code",
      data: result,
    });
  } catch (error) {
    console.error("QR visitor error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};