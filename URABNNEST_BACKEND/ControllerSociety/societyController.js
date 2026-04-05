import Society from "../models/Society.js";
import { Admin } from "../models/admin.models.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { Notification } from "../models/notification.models.js";

/* Generate unique society code */

const generateSocietyCode = (name) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const prefix = name.substring(0, 3).toUpperCase();
  return `${prefix}${random}`;
};

// export const registerSociety = async (req, res) => {
//   try {
//     const {
//       societyName,
//       address,
//       city,
//       state,
//       totalFlats,
//       towers,
//       adminName,
//       adminEmail,
//       adminPhone,
//       password,
//     } = req.body;

//     /* check admin already exists */

//     const existingAdmin = await Admin.findOne({ email: adminEmail });

//     if (existingAdmin) {
//       return res.status(400).json({
//         success: false,
//         message: "Admin already exists",
//       });
//     }

//     /* hash password */

//     const hashedPassword = await bcrypt.hash(password, 10);

//     /* generate society code */

//     const societyCode = generateSocietyCode(societyName);

//     /* create society */

//     const society = await Society.create({
//       name: societyName,
//       address,
//       city,
//       state,
//       totalFlats,
//       towers,
//       societyCode,
//     });

//     /* create admin */

//     const admin = await Admin.create({
//       fullName: adminName,
//       email: adminEmail,
//       phone: adminPhone,
//       password: hashedPassword,
//       societyId: society._id,
//     });

//     /* attach admin to society */

//     society.admin = admin._id;
//     await society.save();

//     res.status(201).json({
//       success: true,
//       message: "Society registered successfully",
//       data: {
//         societyId: society._id,
//         societyCode: society.societyCode,
//         adminId: admin._id,
//       },
//     });
//   } catch (error) {
//     console.log("Society Registration Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// export const registerSociety = async (req, res) => {
//   try {
//     const {
//       societyName,
//       address,
//       city,
//       state,
//       totalFlats,
//       towers,
//       adminName,
//       adminEmail,
//       adminPhone,
//       password,
//     } = req.body;

//     /* check admin already exists */

//     const existingAdmin = await Admin.findOne({ email: adminEmail });

//     if (existingAdmin) {
//       return res.status(400).json({
//         success: false,
//         message: "Admin already exists",
//       });
//     }

//     /* hash password */

//     const hashedPassword = await bcrypt.hash(password, 10);

//     /* generate society code */

//     const societyCode = generateSocietyCode(societyName);

//     /* create society */

//     const society = await Society.create({
//       name: societyName,
//       address,
//       city,
//       state,
//       totalFlats,
//       towers,
//       societyCode,
//     });

//     /* create admin */

//     const admin = await Admin.create({
//       fullName: adminName,
//       email: adminEmail,
//       phone: adminPhone,
//       password: hashedPassword,
//       societyId: society._id,
//     });

//     /* attach admin to society */

//     society.admin = admin._id;
//     await society.save();

//     /* ================= EMAIL SETUP ================= */

//     const transporter = nodemailer.createTransport({
//           host: process.env.SMTP_HOST,
//           port: process.env.SMTP_PORT,
//           secure: false,
//           auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//           },
//         });

//     const mailOptions = {
//       from: `UrbanNest <${process.env.SMTP_USER}>`,
//       to: adminEmail,
//       subject: "🏘️ Society Registered Successfully - UrbanNest",
//       html: `
//         <h2>Welcome to UrbanNest</h2>
//         <p>Hello <b>${adminName}</b>,</p>
//         <p>Your society has been successfully registered.</p>

//         <h3>Society Details</h3>
//         <ul>
//           <li><b>Society Name:</b> ${societyName}</li>
//           <li><b>City:</b> ${city}</li>
//           <li><b>State:</b> ${state}</li>
//           <li><b>Total Flats:</b> ${totalFlats}</li>
//           <li><b>Towers:</b> ${towers}</li>
//           <li><b>Society Code:</b> ${societyCode}</li>
//         </ul>

//         <p>You can now login and manage your society.</p>

//         <br>
//         <p>Regards,<br>UrbanNest Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     /* ================= DATABASE NOTIFICATION ================= */

//     // await Notification.create({
//     //   recipient: admin._id,
//     //   title: "🏘️ Society Registered",
//     //   message: `Your society "${societyName}" has been successfully registered.`,
//     //   type: "SYSTEM",
//     //   metadata: {
//     //     societyId: society._id,
//     //   },
//     // });

//     /* ================= SOCKET NOTIFICATION ================= */

//     const io = req.app.get("io");

//     if (io) {
//       io.to(admin._id.toString()).emit("notification", {
//         title: "Society Registered",
//         message: `Welcome ${adminName}! Your society ${societyName} is now active.`,
//       });
//     }

//     /* ================= RESPONSE ================= */

//     res.status(201).json({
//       success: true,
//       message: "Society registered successfully",
//       data: {
//         societyId: society._id,
//         societyCode: society.societyCode,
//         adminId: admin._id,
//       },
//     });

//   } catch (error) {
//     console.log("Society Registration Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export const registerSociety = async (req, res) => {
  try {
    const {
      societyName,
      address,
      city,
      state,
      totalFlats,
      towers,
      adminName,
      adminEmail,
      adminPhone,
      password,
      otp // <-- added
    } = req.body;

    /* check admin already exists */

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin && existingAdmin.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    /* ================= OTP VERIFY STEP ================= */

    if (otp) {
      const admin = await Admin.findOne({ email: adminEmail });

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      admin.isVerified = true;
      admin.otp = null;
      admin.otpExpiry = null;
      await admin.save();
    }

    /* ================= FIRST STEP (SEND OTP) ================= */

    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

      /* hash password */
      const hashedPassword = await bcrypt.hash(password, 10);

      /* create temp admin */
      let admin = await Admin.findOne({ email: adminEmail });

      if (!admin) {
        admin = await Admin.create({
          fullName: adminName,
          email: adminEmail,
          phone: adminPhone,
          password: hashedPassword,
          otp: generatedOtp,
          otpExpiry,
        });
      } else {
        admin.otp = generatedOtp;
        admin.otpExpiry = otpExpiry;
        await admin.save();
      }

      /* send OTP email */

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `UrbanNest <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: "🔐 Verify your Email - OTP",
        html: `
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${generatedOtp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        `,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to email",
      });
    }

    /* ================= CONTINUE YOUR ORIGINAL CODE ================= */

    /* hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* generate society code */
    const societyCode = generateSocietyCode(societyName);

    /* create society */
    const society = await Society.create({
      name: societyName,
      address,
      city,
      state,
      totalFlats,
      towers,
      societyCode,
    });

    /* update admin */
    const admin = await Admin.findOne({ email: adminEmail });

    admin.societyId = society._id;
    await admin.save();

    /* attach admin to society */
    society.admin = admin._id;
    await society.save();

    /* ================= EMAIL SETUP ================= */

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `UrbanNest <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: "🏘️ Society Registered Successfully - UrbanNest",
      html: `
        <h2>Welcome to UrbanNest</h2>
        <p>Hello <b>${adminName}</b>,</p>
        <p>Your society has been successfully registered.</p>

        <h3>Society Details</h3>
        <ul>
          <li><b>Society Name:</b> ${societyName}</li>
          <li><b>City:</b> ${city}</li>
          <li><b>State:</b> ${state}</li>
          <li><b>Total Flats:</b> ${totalFlats}</li>
          <li><b>Towers:</b> ${towers}</li>
          <li><b>Society Code:</b> ${societyCode}</li>
        </ul>

        <p>You can now login and manage your society.</p>

        <br>
        <p>Regards,<br>UrbanNest Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    /* ================= SOCKET NOTIFICATION ================= */

    const io = req.app.get("io");

    if (io) {
      io.to(admin._id.toString()).emit("notification", {
        title: "Society Registered",
        message: `Welcome ${adminName}! Your society ${societyName} is now active.`,
      });
    }

    /* ================= RESPONSE ================= */

    res.status(201).json({
      success: true,
      message: "Society registered successfully",
      data: {
        societyId: society._id,
        societyCode: society.societyCode,
        adminId: admin._id,
      },
    });

  } catch (error) {
    console.log("Society Registration Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find()
      .select("name societyCode address totalFlats admin createdAt")
      // .populate("admin", "fullname email");
      

    if (!societies || societies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No societies found",
      });
    }

    res.status(200).json({
      success: true,
      count: societies.length,
      data: societies,
    });
  } catch (error) {
    console.error("Fetch Societies Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching societies",
    });
  }
};
