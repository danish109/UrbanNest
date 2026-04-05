import app from "./index.js";
import { io } from "./server.js";
import http from "http";

const PORT = process.env.PORT || 5000;

// Create ONE http server that handles both Express and Socket.IO
const httpServer = http.createServer(app);

// Attach Socket.IO to the same server
io.attach(httpServer);

// Make io accessible in controllers
app.set("io", io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ NestMate running on port ${PORT}`);
  console.log(`🚀 Express API + Socket.IO on same port`);
});

// Graceful shutdown handler
const shutdown = (signal) => {
  console.log(`${signal} received — shutting down...`);

  httpServer.close(() => {
    console.log("Server closed successfully");
    process.exit(0);
  });
};

// Register listeners ONLY once
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

export { app, io };