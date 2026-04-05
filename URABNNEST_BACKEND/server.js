/**
 * NestMate Socket.IO Server
 * Handles real-time notifications, visitor alerts, and chat
 */
import http from "http";
import { Server } from "socket.io";

// REPLACE — pass a dummy handler, socket.io will attach later
const server = http.createServer((req, res) => {
  res.writeHead(200);
});

// REPLACE with this
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// ─── Default Namespace: Notifications ────────────────────────
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  /**
   * Resident registers for private notifications.
   * Frontend: socket.emit("registerResident", residentId)
   */
  socket.on("registerResident", (residentId) => {
    socket.join(residentId);
    console.log(`📍 Resident ${residentId} joined notification room`);
    socket.emit("registered", { success: true, room: residentId });
  });

  /**
   * Guard / Admin joins a shared room (for broadcasting)
   * Frontend: socket.emit("joinRoom", "admin") or socket.emit("joinRoom", "guard")
   */
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🏠 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// ─── Chat Namespace ───────────────────────────────────────────
const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  console.log("💬 Chat user connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    socket.to(groupId).emit("userJoined", { userId: socket.id });
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    socket.to(groupId).emit("userLeft", { userId: socket.id });
  });

  // socket.on("sendMessage", (data) => {
  //   socket.to(data.groupId).emit("receiveMessage", data);
  // });

  socket.on("userTyping", (data) => {
    socket.to(data.groupId).emit("someoneTyping", data);
  });

  socket.on("userStoppedTyping", (data) => {
    socket.to(data.groupId).emit("someoneStoppedTyping", data);
  });

  socket.on("userOnline", (data) => {
    socket.to(data.groupId).emit("userOnlineStatus", { userId: data.userId, status: "online" });
  });

  socket.on("userOffline", (data) => {
    socket.to(data.groupId).emit("userOnlineStatus", { userId: data.userId, status: "offline" });
  });

  socket.on("messageEdited", (data) => {
    socket.to(data.groupId).emit("messageUpdated", {
      messageId: data.messageId,
      message: data.message,
      editedAt: new Date(),
    });
  });

  socket.on("messageDeleted", (data) => {
    socket.to(data.groupId).emit("messageRemoved", { messageId: data.messageId });
  });

  socket.on("disconnect", () => {
    console.log("💬 Chat user disconnected:", socket.id);
  });
});

export default server;
