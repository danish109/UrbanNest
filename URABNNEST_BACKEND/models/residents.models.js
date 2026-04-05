import mongoose from "mongoose";

const residentSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    email: { type: String, sparse: true, unique: true },
    profilePhoto: {
      public_id: { type: String },
      url: { type: String },
    },
    phone: { type: String, },
    password: { type: String, },
    emnum: { type: String,  },
    flatNo: { type: String,  },
    block: { type: String, },
    role: {
      type: String,
      enum: ["ADMIN", "RESIDENT", "GUARD"],
      default: "RESIDENT",
    },
    token: { type: String },
    passkey: { type: String, required: true,sparse:true },
    // Extended profile fields
    bio: { type: String, maxlength: 300 },
    alternatePhone: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    dateOfBirth: { type: Date },
    occupation: { type: String },
    numberOfMembers: { type: Number, default: 1 },
    // Preferences
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      visitor: { type: Boolean, default: true },
      maintenance: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
    },
    // FCM token for push notifications
    fcmToken: { type: String },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date },
  },
  { timestamps: true },
);

const Resident = mongoose.model("Resident", residentSchema); //resident
export { Resident };
