import {Resident} from '../models/residents.models.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOTP, sendOTPEmail } from '../services/emailService.js';
import { storeOTP, verifyOTP } from '../services/otpStore.js';

// Helper function to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
};

export const handleSignup = async (req, res) => {
  try {
    const { fullName, email, phone, password, emnum, flatNo, block, passkey, otp } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !password || !flatNo || !block || !passkey || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields including OTP are required" 
      });
    }

    // // Verify OTP first
    // const otpVerification = verifyOTP(email, otp);
    // if (!otpVerification.isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: otpVerification.message
    //   });
    // }

    // ── Passkey verification ──────────────────────────────────────────────────
    // Find the pre-created slot for this flat using the admin-generated passkey
    const slot = await Resident.findOne({ flatNo, block, passkey });

    if (!slot) {
      // Figure out which part is wrong for a precise error message
      const flatExists = await Resident.findOne({ flatNo, block });

      if (!flatExists) {
        return res.status(400).json({
          success: false,
          message: `No registered flat found for Flat ${flatNo}, Block ${block}. Contact your admin.`,
        });
      }

      // Flat exists but passkey doesn't match
      return res.status(400).json({
        success: false,
        message: `Incorrect passkey for Flat ${flatNo}-${block}. Please enter the exact passkey provided by your admin.`,
      });
    }

    // Slot already claimed (email already filled in)
    if (slot.email) {
      return res.status(400).json({
        success: false,
        message: "This flat has already been registered. Contact admin if this is a mistake.",
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Duplicate email check
    const existing = await Resident.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Update the existing slot instead of creating a new document
    const user = await Resident.findByIdAndUpdate(
      slot._id,
      {
        fullName,
        email,
        phone,
        password: hashed,
        emnum,
        // flatNo and block already set, passkey stays as-is
      },
      { new: true }
    );

    // JWT
    const token = createToken(user._id);

    // Cookie
    res.cookie("jwt-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    // Emit signup success event
    const io = req.app.get('io');
    io.emit('signup_success', { 
      email, 
      message: 'Resident registered successfully' 
    });

    res.status(201).json({
      success: true,
      message: "Resident signup successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        flatNo: user.flatNo,
        block: user.block,
        passkey: user.passkey,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleLogin = async (req, res) => {
  try {
    const { password, phone, passkey } = req.body;
    if (!password || !phone || !passkey) {
      return res.status(400).json({
        success: false,
        message: "All details are mandatory",
      });
    }

    const user = await Resident.findOne({ phone, passkey });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist, Signup or check your number again",
      });
    }
    
    const comparedResult = await bcrypt.compare(password, user.password);
    if (!comparedResult) {
      return res.status(400).json({
        success: false,
        message: "Password is wrong",
      });
    }
    
    if (passkey !== user.passkey) {
      return res.status(400).json({
        success: false,
        message: "Either passkey or role is wrong",
      });
    }
    
    const token = await createToken(user._id);
    res.cookie("jwt-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    console.log("cookie set up in login");
    
    // Emit login success event
    const io = req.app.get('io');
    io.emit('login_success', { 
      phone, 
      message: 'User logged in successfully' 
    });

    return res.status(200).json({
      success: true,
      message: "user Successfully logged in",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        emnum: user.emnum,
        flatNo: user.flatNo,
        block: user.block,
        role: user.role,
        passkey: user.passkey,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }  
};

// New OTP sending endpoint
export const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingUser = await Resident.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    // Store OTP
    storeOTP(email, otp);

    // Emit OTP sent event
    const io = req.app.get('io');
    io.emit('otp_sent', { email, message: 'OTP sent successfully' });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP'
    });
  }
};

export const handleLogout = async (req, res) => {
  try {
    res.clearCookie("jwt-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: "false", message: "Logout again" });
  }
};
