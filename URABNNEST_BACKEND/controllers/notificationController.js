import { Notification } from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const residentId = req.user.id;
    const notifications = await Notification.find({ resident: residentId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ resident: residentId, isRead: false });
    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const residentId = req.user.id;
    await Notification.updateMany({ resident: residentId, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
