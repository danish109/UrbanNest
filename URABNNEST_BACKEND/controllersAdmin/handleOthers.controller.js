import { Notices } from "../models/notices.models.js";
import { Complaints } from "../models/complaints.models.js";
import { Resident } from "../models/residents.models.js";
import { broadcastNotification, sendNotification, sendEmailNotification } from "../services/notificationService.js";

/////////////////////////////////////////////////////HANDLING NOTICES & ANNOUNCEMENTS///////////////////////////////////////////////////////////////

export const handleNoticesCreate = async (req, res) => {
  try {
    const { title, content, category, expiry } = req.body;
    if (!title || !content || !category || !expiry) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const result = await Notices.create({ title, content, category, expiry });
    if (!result) {
      return res.status(400).json({ success: false, message: "Failed to create notice" });
    }

    // Broadcast socket + email notification to ALL residents for announcements
    const io = req.app.get("io");
    await broadcastNotification(io, {
      title: `📢 New ${category}: ${title}`,
      message: content.slice(0, 120) + (content.length > 120 ? "..." : ""),
      type: "ANNOUNCEMENT",
    });

    return res.status(200).json({ success: true, message: "Notice created and residents notified", notice: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const handleNoticesDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotice = await Notices.findByIdAndDelete(id);
    if (!deletedNotice) return res.status(404).json({ error: "Notice not found" });
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice" });
  }
};

export const getAllNotices = async (req, res) => {
  try {
    const result = await Notices.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Got Notices", result });
  } catch (err) {
    res.status(500).json({ error: "Internal Error" });
  }
};

/////////////////////////////////////////////////////HANDLING COMPLAINTS////////////////////////////////////////////////////////////////////

export const getAllComplaints = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const result = await Complaints.find(filter)
      // .populate("residentId", "fullName flatNo block email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Got Complaints", result });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// Admin assigns complaint and updates status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, assignedTo, priority, adminComment } = req.body;

    const complaint = await Complaints.findById(complaintId).populate("residentId", "_id email fullName notifications");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    if (status === "RESOLVED") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = assignedTo || "Admin";
    }

    // Add admin comment if provided
    if (adminComment) {
      updateData.$push = {
        comments: {
          text: adminComment,
          author: "Admin",
          authorRole: "ADMIN",
        },
      };
    }

    const updated = await Complaints.findByIdAndUpdate(complaintId, updateData, { new: true });

    // Notify the resident about their complaint status
    const io = req.app.get("io");
    if (complaint.residentId) {
      const statusLabels = {
        IN_PROGRESS: "is now being worked on",
        RESOLVED: "has been resolved ✅",
        CLOSED: "has been closed",
      };
      const label = statusLabels[status] || `status changed to ${status}`;

      await sendNotification(io, complaint.residentId._id, {
        title: `Complaint Update 🔧`,
        message: `Your complaint "${complaint.title}" ${label}.`,
        type: "COMPLAINT",
        metadata: { complaintId },
      });

      // Email if resolved
      if (status === "RESOLVED" && complaint.residentId.notifications?.email) {
        await sendEmailNotification(
          complaint.residentId.email,
          complaint.residentId.fullName,
          `Complaint Resolved: ${complaint.title}`,
          `Your complaint "${complaint.title}" has been resolved by our team. Thank you for your patience.`
        );
      }
    }

    return res.status(200).json({ success: true, message: "Complaint updated", result: updated });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};

export const resolveComplaints = async (req, res) => {
  try {
    const { complaintId, resolver } = req.body;
    if (!complaintId || !resolver) {
      return res.status(400).json({ success: false, message: "Incomplete request" });
    }

    const result = await Complaints.findByIdAndUpdate(
      complaintId,
      { resolvedBy: resolver, status: "RESOLVED", resolvedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(400).json({ success: false, message: "Failed to resolve complaint" });
    }

    return res.status(200).json({ success: true, message: "Resolved successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Internal error", err: error });
  }
};
