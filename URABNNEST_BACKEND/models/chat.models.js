import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resident",
      
    },
    senderName: {
      type: String,
      required: true,
    },
    senderPhoto: {
      type: String,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatGroups",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "document"],
      default: "text",
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    reactions: [
      {
        emoji: String,
        userId: mongoose.Schema.Types.ObjectId,
        _id: false,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatMessages",
    },
  },
  { timestamps: true }
);

const chatGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    groupType: {
      type: String,
      enum: ["general", "announcements", "complaints", "custom"],
      default: "general",
    },
    groupPhoto: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resident",
      
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "resident",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "resident",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatMessages",
    },
    lastMessageTime: {
      type: Date,
    },
    unreadCount: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        count: {
          type: Number,
          default: 0,
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("chatMessages", chatMessageSchema);
const ChatGroup = mongoose.model("chatGroups", chatGroupSchema);

export { ChatMessage, ChatGroup };