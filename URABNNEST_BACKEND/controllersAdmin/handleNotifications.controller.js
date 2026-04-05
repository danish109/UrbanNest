/**
 * handleNotifications.controller.js
 *
 * Notification Center for NestMate Admin & Residents.
 * Features:
 *   - Get notification history (admin: all | resident: own)
 *   - Mark single notification as read
 *   - Mark all notifications as read
 *   - Get unread count (for dashboard bell badge)
 *   - Delete a notification
 *   - Register / update FCM token (resident registers their device)
 */

import { Notification } from "../models/Notification.js";
import { Resident } from "../models/residents.models.js";

// ─────────────────────────────────────────────
// 1. GET NOTIFICATION HISTORY
// ─────────────────────────────────────────────
/**
 * GET /notifications?type=COMPLAINT&isRead=false&limit=20&page=1
 *
 * Admin   → sees broadcast + all personal notifications
 * Resident → sees only their own + broadcasts
 */
export const getNotifications = async (req, res) => {
  try {
    const { type, isRead, limit = 20, page = 1 } = req.query;
    const { id: userId, role } = req.user;

    const filter = {};

    if (role === "ADMIN") {
      // Admins can see everything
      if (type) filter.type = type;
      if (isRead !== undefined) filter.isRead = isRead === "true";
    } else {
      // Residents see their own + broadcasts
      filter.$or = [{ recipientId: userId }, { isBroadcast: true }];
      if (type) filter.type = type;
      if (isRead !== undefined) filter.isRead = isRead === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Notification.countDocuments();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("recipientId", "fullName flatNo block");

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      notifications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 2. GET UNREAD COUNT (dashboard bell badge)
// ─────────────────────────────────────────────
/**
 * GET /notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    const filter = { isRead: false };

    if (role !== "ADMIN") {
      filter.$or = [{ recipientId: userId }, { isBroadcast: true }];
    }

    const count = await Notification.countDocuments();

    return res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 3. MARK SINGLE NOTIFICATION AS READ
// ─────────────────────────────────────────────
/**
 * PATCH /notifications/read/:notificationId
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { id: userId } = req.user;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Residents can only mark their own (or broadcasts)
    // if (
    //   !notification.isBroadcast &&
    //   String(notification.recipientId) !== String(userId) &&
    //   req.user.role !== "ADMIN"
    // )
    // {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Forbidden",
    //   });
    // }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 4. MARK ALL AS READ
// ─────────────────────────────────────────────
/**
 * PATCH /notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    const filter = { isRead: false };

    if (role !== "ADMIN") {
      filter.$or = [{ recipientId: userId }, { isBroadcast: true }];
    }

    const result = await Notification.updateMany(filter, {
      $set: { isRead: true, readAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 5. DELETE A NOTIFICATION (admin only)
// ─────────────────────────────────────────────
/**
 * DELETE /notifications/delete/:notificationId
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await Notification.findByIdAndDelete(notificationId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 6. REGISTER / UPDATE FCM TOKEN (resident device)
// ─────────────────────────────────────────────
/**
 * POST /notifications/register-token
 * Body: { fcmToken }
 *
 * Resident calls this after logging in on mobile to register their
 * Firebase push token. Also called when token refreshes.
 */
export const registerFCMToken = async (req, res) => {
  try {
    const { id: residentId } = req.user;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "fcmToken is required",
      });
    }

    await Resident.findByIdAndUpdate(residentId, { fcmToken }, { new: true });

    return res.status(200).json({
      success: true,
      message: "FCM token registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 7. SEND WELCOME EMAIL (called on resident creation)
// ─────────────────────────────────────────────
/**
 * Exported as a utility — NOT an HTTP handler.
 * Call from handleHouses.controller.js when allotting a house.
 */
import { sendEmailNotification } from "../services/notificationService.js";

export const sendWelcomeEmail = async ({
  email,
  fullName,
  flatNo,
  block,
  passkey,
}) => {
  await sendEmailNotification(
    email,
    fullName,
    "🏠 Welcome to UrbanNest!",
    `Welcome ${fullName}! Your account has been created for flat ${flatNo}, Block ${block}.`,
    "welcome",
    { flatNo, block, passkey },
  );
};
