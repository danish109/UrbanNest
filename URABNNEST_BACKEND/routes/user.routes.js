import express from "express";
import {
  handleLogin,
  handleLogout,
  handleSignup,
  sendSignupOTP,
} from "../controllersResident/resident.controller.js";
import {
  handleGuardLogin,
  handleGuardLogout,
  handleGuardSignup,
} from "../controllersGuard/guard.controller.js";
import {
  handleAdminLogin,
  handleAdminLogout,
  getAdminProfile,
  updateAdminProfile,
  updateAdminProfilePhoto,
} from "../controllersAdmin/admin.controller.js";
import { verifyOTPController } from "../controllersResident/otpController.js";
import { verifyOTP } from "../services/otpStore.js";
import  {verifyAdmin}  from "../middlewares/verifyCookie.middleware.js";

const userRoutes = express.Router();
userRoutes.post("/send-otp", sendSignupOTP);
userRoutes.post("/resident/signup", handleSignup);
userRoutes.post("/resident/login", handleLogin);
userRoutes.post("/resident/logout", handleLogout);
userRoutes.post("/verify-otp", verifyOTPController);



//userRoutes.post('/admin/signup',handleAdminSignup);
userRoutes.post("/admin/login", handleAdminLogin);
userRoutes.post("/admin/logout", (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});
userRoutes.get("/profile",verifyAdmin,  getAdminProfile);
userRoutes.patch("/profile/update",verifyAdmin,  updateAdminProfile);
userRoutes.patch("/profile/photo",verifyAdmin,  updateAdminProfilePhoto);

userRoutes.post("/guard/signup", handleGuardSignup);
userRoutes.post("/guard/login", handleGuardLogin);
userRoutes.post("/guard/logout", handleGuardLogout);

export { userRoutes };
