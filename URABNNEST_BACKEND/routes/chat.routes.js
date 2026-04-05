import express from "express";
import {
  createChatGroup,
  sendMessage,
  getChatGroups,
  getGroupMessages,
  editMessage,
  deleteMessage,
  addMemberToGroup,
  leaveGroup,
  markAsRead,
   addReaction
} from "../controllersResident/chat.controller.js";
import { verifier } from "../middlewares/verifyCookie.middleware.js";

const chatRoutes = express.Router();

// Group endpoints
chatRoutes.post("/group/create", verifier, createChatGroup);
chatRoutes.get("/groups", verifier, getChatGroups);
chatRoutes.post("/group/:groupId/add-member",  addMemberToGroup);
chatRoutes.post("/group/:groupId/leave", verifier, leaveGroup);
chatRoutes.post("/group/:groupId/read", verifier, markAsRead);
chatRoutes.post("/message/:messageId/react", verifier, addReaction);

// Message endpoints
chatRoutes.post("/message/:groupId", verifier, sendMessage);
chatRoutes.get("/messages/:groupId", verifier, getGroupMessages);
chatRoutes.put("/message/:messageId", verifier, editMessage);
chatRoutes.delete("/message/:messageId", verifier, deleteMessage);

export { chatRoutes };