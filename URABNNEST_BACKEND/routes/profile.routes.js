import express from "express";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  updateNotificationPreferences,
  updateFCMToken,
} from "../controllers/profileController.js";

const profileRoutes = express.Router();

profileRoutes.get("/", verifier, getProfile);
profileRoutes.patch("/update", verifier, updateProfile);
profileRoutes.patch("/photo", verifier, updateProfilePhoto);
profileRoutes.patch("/notifications", verifier, updateNotificationPreferences);
profileRoutes.patch("/fcm-token", verifier, updateFCMToken);

export { profileRoutes };
