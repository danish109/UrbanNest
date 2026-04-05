import { generateOTP, sendOTPEmail } from "../services/emailService.js";
import { storeOTP, verifyOTP, removeOTP } from "../services/otpStore.js";
import { Resident } from "../models/residents.models.js";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email already exists
    const existingUser = await Resident.findOne({ email });
    if (existingUser)
       {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
       
      })
      
    }

    // Generate and send OTP
    const otp = generateOTP();
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    // Store OTP
    storeOTP(email, otp);

    // Get io instance and emit OTP sent event
    const io = req.app.get("io");
    io.emit("otp_sent", { email, message: "OTP sent successfully" });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const verification = verifyOTP(email, otp);

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Get io instance and emit OTP verified event
    const io = req.app.get("io");
    io.emit("otp_verified", { email, message: "OTP verified successfully" });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};
