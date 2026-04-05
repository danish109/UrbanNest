/**
 * NestMate - Application Entry Point
 * Starts Express API server and Socket.IO server
 */
import app from "./index.js";
import server, { io } from "./server.js";

const API_PORT = process.env.PORT || 8000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5000;

// Attach Socket.IO instance so controllers can emit events via req.app.get("io")
app.set("io", io);

// ── Start Express API Server ──────────────────────────────────
const expressServer = app.listen(API_PORT, () => {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║           🏘️  NestMate Backend v2.0.0               ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  🚀 Express API      → http://localhost:${API_PORT}        ║`);
  console.log(`║  🔌 Socket.IO        → ws://localhost:${SOCKET_PORT}         ║`);
  console.log(`║  💬 Chat Namespace   → ws://localhost:${SOCKET_PORT}/chat    ║`);
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║  ✅ /notifications   → Real-time alerts             ║");
  console.log("║  ✅ /qr             → QR Visitor Pass System        ║");
  console.log("║  ✅ /profile        → Resident Profile              ║");
  console.log("║  ✅ /analytics      → Dashboard Stats               ║");
  console.log("║  ✅ /guard          → Visitor + Face Capture        ║");
  console.log("║  ✅ /resident       → Complaints + Comments         ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("");
});

// ── Start Socket.IO Server ────────────────────────────────────
server.listen(SOCKET_PORT, () => {
  console.log(`✅ Socket.IO listening on port ${SOCKET_PORT}`);
});

// ── Graceful Shutdown ─────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n📛 ${signal} received — shutting down gracefully...`);
  expressServer.close(() => console.log("✅ Express server closed"));
  server.close(() => console.log("✅ Socket.IO server closed"));
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { app, server, io };
