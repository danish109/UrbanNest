import express from "express";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const notificationRoutes = express.Router();

notificationRoutes.get("/", verifier, getNotifications);
notificationRoutes.patch("/:id/read", verifier, markAsRead);
notificationRoutes.patch("/read-all", verifier, markAllRead);
notificationRoutes.delete("/:id", verifier, deleteNotification);

export { notificationRoutes };
