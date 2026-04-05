import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      // null means it was a broadcast to all residents
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      default: null,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ANNOUNCEMENT",
        "COMPLAINT",
        "MAINTENANCE",
        "VISITOR",
        "GUARD",
        "GENERAL",
        "BILL"
      ],
      default: "GENERAL",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      // Extra context — complaintId, invoiceId, visitorId, etc.
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    channels: {
      // Which delivery channels were used for this notification
      socket: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      fcm: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
