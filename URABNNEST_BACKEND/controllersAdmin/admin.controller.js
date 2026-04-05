import { Admin } from "../models/admin.models.js";
import { v2 as cloudinary } from "cloudinary";
import { createToken } from "../services/auth.js";
import bcrypt from "bcrypt";

// export const handleAdminSignup = async(req,res) => {
//     try {
//         const {fullName,email, password, phone,emnum,flatNo,block, role,passkey,adminlevel} = req.body;
//         //const {profilePhoto} = req.files;

//          //==========================verification section===================//
//          if(!fullName || !email || !password || !phone || !emnum || !passkey || !adminlevel){
//             return res.status(400).json({
//                 success:false,
//                 message:"All details are mandatory",
//             });
//         }
//         // if(!profilePhoto) {
//         //     return res.status(400).json({
//         //         success:false,
//         //         message:"All details are mandatory",
//         //     });
//         // }

//         //=====================checking for preuser===========================
//         const preUser = await Admin.findOne({phone:phone, });
//         if(preUser){
//             return res.status(400).json({
//                 success:false,
//                 message:"User already exists for current registry",
//             });
//         }

//         //validating a valid signup via Houses data of admin side
//         // const record = await Houses.findOne({flatNo});
//         //if(!record){
//         //     return res.status(400).json({
//         //         success:false,
//         //         message:"You are not found in our databases",
//         //     });
//         // }

//         // if((record.phone) !== phone || (passkey !== record.passkey) || (flatNo !== record.flatNo) || (block !== record.block) || (role !== record.role)){
//         //     return res.status(400).json({
//         //         success:false,
//         //         message:"Re-verify your entered details",
//         //     });
//         // }

//         //================image mimetype verify========================
//         // const allowedMimeType = ['image/png','image/jpeg', 'webp'];

//         // if(!allowedMimeType.includes(profilePhoto.mimetype.toLowerCase())){
//         //     return res.status(400).json({
//         //         success:false,
//         //         message:"Upload image of the given format only",
//         //     });
//         // }

//         //==========================image uppload to cloudinary===================//

//         // const cloudinaryRes = await cloudinary.uploader.upload(profilePhoto.tempFilePath)
//         // if(!cloudinaryRes.secure_url) {
//         //     return res.status(400).json({
//         //         success:false,
//         //         message:"Failed to upload image, try again",
//         //     });
//         // }
//         // console.log(cloudinaryRes);

//         //========================user created====================================//

//         const hashedPassword = await bcrypt.hash(password,10);
//         const response = await Admin.create({
//             fullName,
//             email,
//             password:hashedPassword,
//             phone,
//             adminlevel,
//             emnum,
//             flatNo,
//             block,
//             role,
//             passkey,
//             // profilePhoto:{
//             //     public_id: cloudinaryRes.public_id,
//             //     url:cloudinaryRes.url,
//             // }
//         });

//         await response.save();
//         console.log("User Created");
//         try {
//             const token = await createToken(response._id);
//             res.cookie("jwt-token",token,{
//                 httpOnly:true,
//                 secure:process.env.NODE_ENV === 'production',
//                 sameSite:'strict',
//                 maxAge:7 * 24 * 60 * 60 * 1000,
//             });
//             console.log("cookie set up")
//             return res.status(200).json({success:true,
//                 message:"user Successfully created",
//                 user:{
//                     fullName:fullName,
//                     email:email,
//                     adminlevel,
//                     phone:phone,
//                     emnum:emnum,
//                     flatNo:flatNo,
//                     block:block,
//                     role:role,
//                     passkey:passkey,
//                     //profilePhoto:profilePhoto
//                 }
//             })
//         } catch (error) {
//             return res.status(400).json({msg:"error in tokenization"})
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:"Seems to be a server issue",
//             error:error
//         });
//     }
// }

export const handleAdminLogin = async (req, res) => {
  try {
    const { password, phone } = req.body;
    if (!password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All details are mandatory",
      });
    }

    const user = await Admin.findOne({ phone });
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
          email: user.email,
          phone: user.phone,
          adminlevel: user.adminlevel,
          emnum: user.emnum,
          role: user.role,
          passkey: user.passkey,
          profilePhoto: user.profilePhoto,
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

export const handleAdminLogout = async (req, res) => {
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



// GET ADMIN PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId)
      .select("-password -token -otp");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: admin,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// UPDATE ADMIN PROFILE
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { fullName, phone, emnum } = req.body;

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (emnum !== undefined) updateData.emnum = emnum;

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true }
    ).select("-password -token -otp");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      profile: updated,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//  UPDATE PROFILE PHOTO
export const updateAdminProfilePhoto = async (req, res) => {
  try {
    const adminId = req.user.id;

    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded",
      });
    }

    const { photo } = req.files;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(photo.mimetype.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Only PNG, JPEG, JPG, WEBP allowed",
      });
    }

    // 🔥 Delete old image
    const admin = await Admin.findById(adminId);
    if (admin.profilePhoto?.public_id) {
      await cloudinary.uploader
        .destroy(admin.profilePhoto.public_id)
        .catch(() => {});
    }

    // 🔥 Upload new image
    const result = await cloudinary.uploader.upload(photo.tempFilePath, {
      folder: "nestmate/admins",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      {
        profilePhoto: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      },
      { new: true }
    ).select("-password -token -otp");

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      profile: updated,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};