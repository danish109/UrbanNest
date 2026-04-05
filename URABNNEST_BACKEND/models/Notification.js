import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ✅ Recipient (for single user)
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      default: null,
    },

    // ✅ Alternative (your old field - keep for compatibility)
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      default: null,
    },

    // ✅ Broadcast support
    isBroadcast: {
      type: Boolean,
      default: false,
    },

    // ✅ Core content
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    // ✅ Merged ENUM (ALL types combined)
    type: {
      type: String,
      enum: [
        "ANNOUNCEMENT",
        "COMPLAINT",
        "MAINTENANCE",
        "VISITOR",
        "GUARD",
        "GENERAL",
        "BILL",
        "PACKAGE",
        "PAYMENT",
        "ALERT",
        "OTHER",
        "EMERGENCY"
      ],
      default: "OTHER",
    },

    // ✅ Read tracking
    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // ✅ Frontend navigation
    link: {
      type: String,
      default: "",
    },

    // ✅ Extra data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ✅ Delivery tracking (very important 🔥)
    channels: {
      socket: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      fcm: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);


// ✅ Indexes (optimized queries)
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ resident: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });


// ✅ Export safely (avoid overwrite in dev)
export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);