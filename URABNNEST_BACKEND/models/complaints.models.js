import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId },
    authorRole: { type: String, enum: ["ADMIN", "RESIDENT", "GUARD"] },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    weight: { type: Number, default: 0 },
    nature: { type: String, enum: ["PUBLIC", "PRIVATE"], required: true },
    residentId: { type: Schema.Types.ObjectId, ref: "resident" },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    assignedTo: { type: String },
    assignedToId: { type: Schema.Types.ObjectId },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    comments: [commentSchema],
    category: {
      type: String,
      enum: ["PLUMBING", "ELECTRICAL", "CLEANLINESS", "SECURITY", "NOISE", "OTHER"],
      default: "OTHER",
    },
    photo: {
      public_id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true }
);

const Complaints = mongoose.model("complaints", complaintSchema);
export { Complaints };
