import { Guard } from "../models/guardSignup.models.js";
import { GuardData } from "../models/guards.models.js";
import { v2 as cloudinary } from "cloudinary";
import { createToken } from "../services/auth.js";

import bcrypt from "bcrypt";

export const handleGuardSignup = async (req, res) => {
  try {
    const { fullName, password, phone } = req.body;
    //const {profilePhoto} = req.files;

    //==========================verification section===================//
    if (!fullName || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All details are mandatory",
      });
    }
    // if(!profilePhoto) {
    //     return res.status(400).json({
    //         success:false,
    //         message:"All details are mandatory",
    //     });
    // }

    //=====================checking for preuser===========================
    const preUser = await Guard.findOne({ phone: phone });
    if (preUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists for current registry",
      });
    }

    //validating a valid signup via Houses data of admin side
    //  const record = await GuardData.findOne({guardKey});
    // // if(!record){
    // //      return res.status(400).json({
    // //          success:false,
    // //          message:"You are not found in our databases",
    // //      });
    // //  }
    //  if((record.phone) !== phone || (guardKey !== record.guardKey)){
    //      return res.status(400).json({
    //          success:false,
    //          message:"Re-verify your entered details",
    //      });
    //  }

    //================image mimetype verify========================
    // const allowedMimeType = ['image/png','image/jpeg', 'webp'];

    // if(!allowedMimeType.includes(profilePhoto.mimetype.toLowerCase())){
    //     return res.status(400).json({
    //         success:false,
    //         message:"Upload image of the given format only",
    //     });
    // }

    //==========================image uppload to cloudinary===================//

    // const cloudinaryRes = await cloudinary.uploader.upload(profilePhoto.tempFilePath)
    // if(!cloudinaryRes.secure_url) {
    //     return res.status(400).json({
    //         success:false,
    //         message:"Failed to upload image, try again",
    //     });
    // }
    // console.log(cloudinaryRes);

    //========================user created====================================//

    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await Guard.create({
      fullName,
      password: hashedPassword,
      phone,
      // guardKey,
      // profilePhoto:{
      //     public_id: cloudinaryRes.public_id,
      //     url:cloudinaryRes.url,
      // }
    });

    await response.save();
    console.log("User Created");
    try {
      const token = await createToken(response._id);
      res.cookie("jwt-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      console.log("cookie set up");
      return res.status(200).json({
        success: true,
        message: "user Successfully created",
        user: {
          id: response._id,
          fullName: response.fullName,
          phone: response.phone,
          // guardKey:guardKey,
          // //profilePhoto:profilePhoto
        },
      });
    } catch (error) {
      return res.status(400).json({ msg: "error in tokenization" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const handleGuardLogin = async (req, res) => {
  try {
    const { password, phone } = req.body;
    if (!password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All details are mandatory",
      });
    }

    const user = await Guard.findOne({ phone });
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
    // if((guardKey !== user.guardKey)){
    //     return res.status(400).json({
    //         success:false,
    //         message:"Entered guardKey  is wrong",
    //     });
    // }
    try {
      const token = await createToken(user._id);
      res.cookie("jwt-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      console.log("cookie set up in login");
      return res.status(200).json({
        success: true,
        message: "user Successfully logged in",
        user: {
          id: user._id,
          fullName: user.fullName,
          // passkey:user.guardKey,
          //profilePhoto:user.profilePhoto
        },
      });
    } catch (error) {
      return res.status(400).json({ msg: "error in tokenization" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Seems to be a server issue",
      error: error,
    });
  }
};

export const handleGuardLogout = async (req, res) => {
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

export const getAllguard = async (req, res) => {
  try {
    const guards = await GuardData.find().select("-password"); // exclude password
    res.status(200).json({ success: true, guards: guards });
  } catch (error) {
    console.error("Error fetching guard:", error);
    res.status(500).json({ message: "Failed to fetch guards" });
  }
};
