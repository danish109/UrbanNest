/**
 * Resident Profile Management
 * Update photo, contact info, emergency contact, notification preferences
 */
import { Resident } from "../models/residents.models.js";
import { v2 as cloudinary } from "cloudinary";

// GET /profile — get own profile
export const getProfile = async (req, res) => {
  try {
    const residentId = req.user.id;
    const resident = await Resident.findById(residentId).select("-password -token -passkey");
    if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

    return res.status(200).json({ success: true, profile: resident });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// PATCH /profile/update — update profile fields
export const updateProfile = async (req, res) => {
  try {
    const residentId = req.user.id;
    const {
      fullName,
      phone,
      alternatePhone,
      bio,
      occupation,
      numberOfMembers,
      dateOfBirth,
      emergencyContact,
    } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone;
    if (bio !== undefined) updateData.bio = bio;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (numberOfMembers !== undefined) updateData.numberOfMembers = numberOfMembers;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;

    const updated = await Resident.findByIdAndUpdate(residentId, updateData, { new: true }).select("-password -token -passkey");

    return res.status(200).json({ success: true, message: "Profile updated", profile: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// PATCH /profile/photo — update profile photo
export const updateProfilePhoto = async (req, res) => {
  try {
    const residentId = req.user.id;

    if (!req.files || !req.files.photo) {
      return res.status(400).json({ success: false, message: "No photo uploaded" });
    }

    const { photo } = req.files;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(photo.mimetype.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Only PNG, JPEG, JPG, WEBP images are allowed" });
    }

    // Delete old photo from cloudinary if exists
    const resident = await Resident.findById(residentId);
    if (resident.profilePhoto?.public_id) {
      await cloudinary.uploader.destroy(resident.profilePhoto.public_id).catch(() => {});
    }

    // Upload new photo
    const result = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "nestmate/residents",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });

    const updated = await Resident.findByIdAndUpdate(
      residentId,
      { profilePhoto: { public_id: result.public_id, url: result.secure_url } },
      { new: true }
    ).select("-password -token -passkey");

    return res.status(200).json({ success: true, message: "Profile photo updated", profile: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// PATCH /profile/notifications — update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const residentId = req.user.id;
    const { email, push, visitor, maintenance, announcements } = req.body;

    const notifUpdate = {};
    if (email !== undefined) notifUpdate["notifications.email"] = email;
    if (push !== undefined) notifUpdate["notifications.push"] = push;
    if (visitor !== undefined) notifUpdate["notifications.visitor"] = visitor;
    if (maintenance !== undefined) notifUpdate["notifications.maintenance"] = maintenance;
    if (announcements !== undefined) notifUpdate["notifications.announcements"] = announcements;

    const updated = await Resident.findByIdAndUpdate(residentId, notifUpdate, { new: true }).select("notifications");

    return res.status(200).json({ success: true, message: "Notification preferences updated", notifications: updated.notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /profile/fcm-token — save FCM push token
export const updateFCMToken = async (req, res) => {
  try {
    const residentId = req.user.id;
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: "FCM token required" });

    await Resident.findByIdAndUpdate(residentId, { fcmToken });
    return res.status(200).json({ success: true, message: "FCM token saved" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
