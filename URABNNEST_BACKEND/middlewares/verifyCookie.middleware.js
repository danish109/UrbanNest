import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.models.js"; // Adjust path as needed
import { Resident } from "../models/residents.models.js";

export const verifier = async (req, res, next) => {
  try {
    // Check both cookie and Authorization header
    let token = req.cookies?.token || req.cookies?.["jwt-token"];

    // If not in cookies, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login first.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    await verifier(req, res, async () => {
      try {
        const user = await Admin.findById(req.user.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        if (user.role !== "ADMIN") {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
          });
        }

        req.admin = user; // Attach admin user to request
        next();
      } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(500).json({
          success: false,
          message: "Server error during admin verification",
        });
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
// const qrToken = jwt.sign(
//   { residentId: Resident._id, flatNo: resident.flatNo, block: resident.block, visitorFor: resident.fullName },
//   process.env.QR_SECRET,
//   { expiresIn: "24h" }  // or "1h" for one-time use QRs
// );