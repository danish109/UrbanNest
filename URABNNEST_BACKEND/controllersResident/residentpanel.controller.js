import { Visitors } from "../models/visitors.model.js";
import { Notices } from "../models/notices.models.js";
import { Complaints } from "../models/complaints.models.js";
import { Billables } from "../models/billable.models.js";
import { Services } from "../models/services.models.js";
import { Resident } from "../models/residents.models.js";
import mongoose from "mongoose";

// Visitor info for resident
export const getVisitorInfo = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id) return res.status(400).json({ success: false, message: "Login first" });

    let visitors = await Visitors.find({ resident: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, visitorsData: visitors });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// Notices and events
export const getNotices = async (req, res) => {
  try {
    const notices = await Notices.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notice: notices });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

// Create complaint — with priority, category, photo
export const createComplaint = async (req, res) => {
  try {
    const { title, description, nature, priority, category } = req.body;
    if (!title || !description || !nature) {
      return res.status(400).json({ success: false, message: "Title, description and nature are required" });
    }

    const creator = req.user?.id;
    const complaintData = {
      title,
      description,
      nature,
      priority: priority || "MEDIUM",
      category: category || "OTHER",
      status: "OPEN",
    };

    if (nature === "PRIVATE") {
      complaintData.residentId = creator;
    }

    // Optional photo upload
    if (req.files?.photo) {
      const { v2: cloudinary } = await import("cloudinary");
      const upload = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
        folder: "nestmate/complaints",
      });
      complaintData.photo = { public_id: upload.public_id, url: upload.secure_url };
    }

    const result = await Complaints.create(complaintData);
    return res.status(201).json({ success: true, message: "Complaint submitted", complaint: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get complaints — resident sees their own private + all public
export const getComplaint = async (req, res) => {
  try {
    const residentId = req.user.id;
    const complaints = await Complaints.find({
      $or: [{ nature: "PUBLIC" }, { residentId, nature: "PRIVATE" }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, complaintsAll: complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add a comment to a complaint
export const addComplaintComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const residentId = req.user.id;
    const resident = await Resident.findById(residentId).select("fullName role");

    if (!text) return res.status(400).json({ success: false, message: "Comment text required" });

    const complaint = await Complaints.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            text,
            author: resident.fullName,
            authorId: residentId,
            authorRole: resident.role,
          },
        },
      },
      { new: true }
    );

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    return res.status(200).json({ success: true, message: "Comment added", complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Upvote a complaint
export const upvote = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Complaints.findByIdAndUpdate(id, { $inc: { weight: 1 } }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: "Complaint not found" });
    return res.status(200).json({ success: true, message: "Upvoted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find().select("-password  -passkey");
    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch residents" });
  }
};

export const getService = async (req, res) => {
  try {
    const serviceData = await Services.aggregate([
      {
        $lookup: {
          from: "vendors", // ⚠️ verify this name
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    console.log("SERVICE DATA:", serviceData); // debug

    if (!serviceData || serviceData.length === 0) {
      return res.status(200).json({   // ⚠️ changed to 200
        success: false,
        message: "No services found",
      });
    }

    return res.status(200).json({
      success: true,
      services: serviceData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server issue",
      error,
    });
  }
};

export const addToBill = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);
    if (!service) return res.status(400).json({ success: false, message: "No such service exists" });

    const residentId = req.user._id;
    const result = await Billables.create({
      serviceName: service.serviceName,
      vendorId: service.vendorId,
      serviceId: service._id,
      price: service.price,
      units: req.body.units,
      residentId,
    });

    return res.status(200).json({ success: true, message: "Service added to your bill", billable: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server issue", error: error.message });
  }
};

export const deleteFromBill = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Billables.findByIdAndDelete(id);
    if (!result) return res.status(400).json({ success: false, message: "Not deleted, try again" });
    return res.status(200).json({ success: true, message: "Service deleted from your bill" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server issue" });
  }
};

export const updateInBill = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Billables.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) return res.status(400).json({ success: false, message: "Not updated, try again" });
    return res.status(200).json({ success: true, message: "Bill updated", billable: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server issue" });
  }
};

export const rateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Services.findById(id);
    if (!service) return res.status(400).json({ success: false, message: "Service not found" });

    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const newReputation = (service.reputation * service.peopleRated + rating) / (service.peopleRated + 1);
    const result = await Services.findByIdAndUpdate(
      id,
      { reputation: newReputation, peopleRated: service.peopleRated + 1 },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Rating recorded", service: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server issue" });
  }
};

export const seeBillables = async (req, res) => {
  try {
    const userId = req.user._id;
    const servicesTaken = await Billables.aggregate([
      { $match: { residentId: userId } },
      { $lookup: { from: "services", localField: "vendorId", foreignField: "vendorId", as: "serviceInfo" } },
      { $unwind: { path: "$serviceInfo", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "vendors", localField: "serviceInfo.vendorId", foreignField: "_id", as: "serviceInfo.vendor" } },
      { $unwind: { path: "$serviceInfo.vendor", preserveNullAndEmptyArrays: true } },
    ]);

    return res.status(200).json({ success: true, service: servicesTaken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server issue" });
  }
};
