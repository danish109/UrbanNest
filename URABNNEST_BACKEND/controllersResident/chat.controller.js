import { ChatMessage, ChatGroup } from "../models/chat.models.js";
import { Resident } from "../models/residents.models.js";
import mongoose from "mongoose";


export const createChatGroup = async (req, res) => {
  try {
    const { groupName, description, groupType, members } = req.body;
    const createdBy = req.user._id;

    // Validate group type
    const validTypes = ["general", "announcements", "complaints", "custom"];
    if (!validTypes.includes(groupType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group type",
      });
    }

    

    const newGroup = new ChatGroup({
      groupName,
      description,
      groupType,
      createdBy,
      members: members || [createdBy],
      admins: [createdBy],
      lastMessageTime: new Date(),
    });

    await newGroup.save();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: newGroup,
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: error.message,
    });
  }
};

// Send Message
// export const sendMessage = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { message, messageType = "text", fileUrl, fileName, replyTo } =
//       req.body;
//     const senderId = req.user._id;

//     // Verify group exists
//     const group = await ChatGroup.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: "Group not found",
//       });
//     }

//     // Verify user is member of group
//     if (!group.members.includes(senderId)) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not a member of this group",
//       });
//     }

//     const resident = await Resident.findById(senderId);

//     const newMessage = new ChatMessage({
//       senderId,
//       senderName: resident.fullName,
//       senderPhoto: resident.profilePhoto?.url,
//       groupId,
//       message,
//       messageType,
//       fileUrl,
//       fileName,
//       replyTo: replyTo || null,
//     });

//     await newMessage.save();

//     // Update group's last message
//     await ChatGroup.findByIdAndUpdate(groupId, {
//       lastMessage: newMessage._id,
//       lastMessageTime: new Date(),
//     });

//     // Populate reply info if exists
//     if (replyTo) {
//       await newMessage.populate("replyTo");
//     }

//     // Emit message via Socket.io
//     const io = req.app.get("io");
//     io.to(groupId).emit("newMessage", {
//       _id: newMessage._id,
//       senderId,
//       senderName: resident.fullName,
//       senderPhoto: resident.profilePhoto?.url,
//       message,
//       messageType,
//       fileUrl,
//       fileName,
//       createdAt: newMessage.createdAt,
//       replyTo: newMessage.replyTo,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully",
//       data: newMessage,
//     });
//   } catch (error) {
//     console.error("Send message error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send message",
//       error: error.message,
//     });
//   }
// };
export const sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message, messageType = "text", fileUrl, fileName, replyTo } = req.body;
    const senderId = req.user._id;

    // ✅ Use req.user directly instead of fetching from DB
    const senderName = req.user.fullName || req.user.name || "Unknown";
    const senderPhoto = req.user.profilePhoto?.url || req.user.photo || null;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // if (!group.members.includes(senderId)) {
    //   return res.status(403).json({ success: false, message: "You are not a member of this group" });
    // }

    const newMessage = new ChatMessage({
      senderId,
      senderName,       // ✅ from req.user
      senderPhoto,      // ✅ from req.user
      groupId,
      message,
      messageType,
      fileUrl,
      fileName,
      replyTo: replyTo || null,
    });

    await newMessage.save();

    await ChatGroup.findByIdAndUpdate(groupId, {
      lastMessage: newMessage._id,
      lastMessageTime: new Date(),
    });

    if (replyTo) {
      await newMessage.populate("replyTo");
    }

    const io = req.app.get("io");
    io.to(groupId).emit("newMessage", {
      _id: newMessage._id,
      senderId,
      senderName,
      senderPhoto,
      message,
      messageType,
      fileUrl,
      fileName,
      createdAt: newMessage.createdAt,
      replyTo: newMessage.replyTo,
    });

    res.status(201).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

// Get Chat Groups
export const getChatGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 20, page = 1 } = req.query;

    let query = { members: userId, isActive: true };
    if (type) query.groupType = type;

    const groups = await ChatGroup.find(query)
      .populate("lastMessage", "message createdAt")
      .populate("createdBy", "fullName")
      .sort({ lastMessageTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatGroup.countDocuments(query);

    res.json({
      success: true,
      data: groups,
      // pagination: {
      //   total,
      //   pages: Math.ceil(total / limit),
      //   current: page,
      // },
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message,
    });
  }
};

// Get Group Messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const { limit = 50, page = 1 } = req.query;

    // // Verify user is member
    // const group = await ChatGroup.findById(groupId);
    // if (!group || !group.members.includes(userId)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Unauthorized",
    //   });
    // }

    const messages = await ChatMessage.find({ groupId })
      .populate("senderId", "fullName profilePhoto")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatMessage.countDocuments({ groupId });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Edit Message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can edit
    if (chatMessage.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Can't edit after 24 hours
    const hoursDiff =
      (new Date() - new Date(chatMessage.createdAt)) / (1000 * 3600);
    if (hoursDiff > 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit message older than 24 hours",
      });
    }

    const updatedMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        message,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true }
    );

    // Emit edit event
    const io = req.app.get("io");
    io.to(chatMessage.groupId.toString()).emit("messageEdited", {
      messageId,
      message,
      editedAt: updatedMessage.editedAt,
    });

    res.json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit message",
      error: error.message,
    });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender or group admin can delete
    const group = await ChatGroup.findById(chatMessage.groupId);
    const isAdmin = group.admins.includes(userId);
    const isSender = chatMessage.senderId.toString() === userId.toString();

    if (!isAdmin && !isSender) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await ChatMessage.findByIdAndDelete(messageId);

    // Emit delete event
    const io = req.app.get("io");
    io.to(chatMessage.groupId.toString()).emit("messageDeleted", {
      messageId,
    });

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

// Add Reaction to Message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already reacted with same emoji
    const existingReaction = chatMessage.reactions.find(
      (r) =>
        r.userId.toString() === userId.toString() &&
        r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      chatMessage.reactions = chatMessage.reactions.filter(
        (r) =>
          !(
            r.userId.toString() === userId.toString() &&
            r.emoji === emoji
          )
      );
    } else {
      // Add reaction
      chatMessage.reactions.push({
        emoji,
        userId,
      });
    }

    await chatMessage.save();

    // Emit reaction event
    const io = req.app.get("io");
    io.to(chatMessage.groupId.toString()).emit("reactionAdded", {
      messageId,
      reactions: chatMessage.reactions,
    });

    res.json({
      success: true,
      message: "Reaction updated successfully",
      data: chatMessage.reactions,
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};

// Add Member to Group
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only admins can add members
    // if (!group.admins.includes(userId)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only group admins can add members",
    //   });
    // }

    if (group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    group.members.push(memberId);
    await group.save();

    // Emit member added event
    const io = req.app.get("io");
    io.to(groupId).emit("memberAdded", {
      memberId,
      memberName: (await Resident.findById(memberId)).fullName,
    });

    res.json({
      success: true,
      message: "Member added successfully",
      data: group,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// Remove Member from Group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only admins can remove members
    if (!group.admins.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only group admins can remove members",
      });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    group.admins = group.admins.filter((a) => a.toString() !== memberId);
    await group.save();

    // Emit member removed event
    const io = req.app.get("io");
    io.to(groupId).emit("memberRemoved", { memberId });

    res.json({
      success: true,
      message: "Member removed successfully",
      data: group,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

// Leave Group
// export const leaveGroup = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const userId = req.user._id;

//     const group = await ChatGroup.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: "Group not found",
//       });
//     }

//     group.members = group.members.filter((m) => m.toString() !== userId);

//     // If user was admin, remove from admins too
//     if (group.admins.includes(userId)) {
//       group.admins = group.admins.filter((a) => a.toString() !== userId);
//     }

//     // If no members left, mark as inactive
//     if (group.members.length === 0) {
//       group.isActive = false;
//     }

//     await group.save();

//     // Emit member left event
//     const io = req.app.get("io");
//     io.to(groupId).emit("memberLeft", { userId });

//     res.json({
//       success: true,
//       message: "You left the group successfully",
//     });
//   } catch (error) {
//     console.error("Leave group error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to leave group",
//       error: error.message,
//     });
//   }
// };
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id || req.user?.id; // ← handle both

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.members = group.members.filter(
      (m) => m?.toString() !== userId.toString() // ← added ?. safe access
    );

    if (group.admins.includes(userId)) {
      group.admins = group.admins.filter(
        (a) => a?.toString() !== userId.toString() // ← added ?. safe access
      );
    }

    if (group.members.length === 0) {
      group.isActive = false;
    }

    await group.save();

    const io = req.app.get("io");
    io.to(groupId).emit("memberLeft", { userId });

    res.json({ success: true, message: "You left the group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ success: false, message: "Failed to leave group", error: error.message });
  }
};

// Update Group Info
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupName, description, groupPhoto } = req.body;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only admins can update
    if (!group.admins.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only group admins can update group info",
      });
    }

    if (groupName) group.groupName = groupName;
    if (description) group.description = description;
    if (groupPhoto) group.groupPhoto = groupPhoto;

    await group.save();

    // Emit update event
    const io = req.app.get("io");
    io.to(groupId).emit("groupUpdated", {
      groupName: group.groupName,
      description: group.description,
      groupPhoto: group.groupPhoto,
    });

    res.json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message,
    });
  }
};

// Delete Group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator or super admin can delete
    if (
      group.createdBy.toString() !== userId.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await ChatGroup.findByIdAndDelete(groupId);
    await ChatMessage.deleteMany({ groupId });

    // Emit delete event
    const io = req.app.get("io");
    io.to(groupId).emit("groupDeleted");

    res.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message,
    });
  }
};

// // Mark Group as Read
// export const markAsRead = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const userId = req.user._id;

//     const group = await ChatGroup.findById(groupId);
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: "Group not found",
//       });
//     }

//     // Update unread count for user
//     const unreadIndex = group.unreadCount.findIndex(
//       (u) => u.userId.toString() === userId.toString()
//     );

//     if (unreadIndex > -1) {
//       group.unreadCount[unreadIndex].count = 0;
//     } else {
//       group.unreadCount.push({
//         userId,
//         count: 0,
//       });
//     }

//     await group.save();

//     res.json({
//       success: true,
//       message: "Marked as read",
//     });
//   } catch (error) {
//     console.error("Mark as read error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to mark as read",
//       error: error.message,
//     });
//   }
// };
export const markAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id || req.user?.id; // ← handle both _id and id

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const unreadIndex = group.unreadCount.findIndex(
      (u) => u.userId?.toString() === userId.toString() // ← added ?. safe access
    );

    if (unreadIndex > -1) {
      group.unreadCount[unreadIndex].count = 0;
    } else {
      group.unreadCount.push({ userId, count: 0 });
    }

    await group.save();
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read", error: error.message });
  }
};