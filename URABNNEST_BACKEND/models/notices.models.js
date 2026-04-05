import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum:["GENERAL", "EVENT", "ALERT", "MAINTENANCE","EMERGENCY"],
      required: true,
    },
    expiry: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

noticeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Notices = mongoose.model("notices", noticeSchema);
export { Notices };
