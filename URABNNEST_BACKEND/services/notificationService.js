import { Notification } from "../models/Notification.js";
import { Resident } from "../models/residents.models.js";
import transporter from "./emailService.js";

/**
 * Send a real-time + persisted notification to a resident
 * @param {object} io - Socket.IO instance
 * @param {string} residentId - Mongoose ObjectId string
 * @param {object} payload - { title, message, type, metadata, link }
 */
//this one is old
// export const sendNotification = async (io, residentId, payload) => {
//   try {
//     const { title, message, type = "OTHER", metadata = {}, link = "" } = payload;

//     // 1. Persist to DB
//     const notification = await Notification.create({
//       title,
//       message,
//       type,
//       resident: residentId,
//       metadata,
//       link,
//     });

//     // 2. Emit via Socket.IO to that resident's private room
//     if (io) {
//       io.to(residentId.toString()).emit("notification", {
//         _id: notification._id,
//         title,
//         message,
//         type,
//         link,
//         metadata,
//         isRead: false,
//         createdAt: notification.createdAt,
//       });
//     }

//     return notification;
//   } catch (error) {
//     console.error("sendNotification error:", error);
//   }
// };
export const sendNotification = async (io, residentId, payload) => {
  try {
    const { title, message, type = "OTHER", metadata = {}, link = "" } = payload;

    // 1. Persist to DB
    const notification = await Notification.create({
      title,
      message,
      type,
      resident: residentId,
      metadata,
      link,
    });

    // 2. Emit via Socket.IO
    if (io) {
      io.to(residentId.toString()).emit("notification", {
        _id: notification._id,
        title,
        message,
        type,
        link,
        metadata,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    // 🔥 3. SEND EMAIL EVERY TIME
    const resident = await Resident.findById(residentId).select("email fullName notifications");

    if (resident && resident.email) {
      // optional: respect user preference
      if (resident.notifications?.email !== false) {
        sendEmailNotification(
          resident.email,
          resident.fullName,
          title,
          message
        ).catch(console.error);
      }
    }

    return notification;
  } catch (error) {
    console.error("sendNotification error:", error);
  }
};

/**
 * Broadcast an announcement to ALL residents
 * @param {object} io - Socket.IO instance
 * @param {object} payload - { title, message, type }
 */
export const broadcastNotification = async (io, payload) => {
  try {
    const { title, message, type = "ANNOUNCEMENT" } = payload;

    // Get all active residents
    const residents = await Resident.find({ isActive: true }).select("_id email fullName notifications");

    const notifications = [];

    for (const resident of residents) {
      const notif = await Notification.create({
        title,
        message,
        type,
        resident: resident._id,
      });
      notifications.push(notif);

      // Socket emit
      if (io) {
        io.to(resident._id.toString()).emit("notification", {
          _id: notif._id,
          title,
          message,
          type,
          isRead: false,
          createdAt: notif.createdAt,
        });
      }

      // Email notification if resident has email notifications enabled
      if (resident.notifications?.email) {
        sendEmailNotification(resident.email, resident.fullName, title, message).catch(console.error);
      }
    }

    return notifications;
  } catch (error) {
    console.error("broadcastNotification error:", error);
  }
};

/**
 * Send an email notification
 */
export const sendEmailNotification = async (email, name, subject, body) => {
  try {
    await transporter.sendMail({
      from: `NestMate <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `NestMate: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:40px 20px;">
            <tr><td>
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
                <tr>
                  <td style="padding:40px 48px 24px;border-bottom:1px solid #e8ebed;text-align:center;">
                    <div style="display:inline-block;background:linear-gradient(135deg,#5b7cff,#4a63d9);border-radius:12px;padding:12px 20px;">
                      <span style="color:#fff;font-size:22px;font-weight:700;">🏘️ NestMate</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 48px;">
                    <p style="color:#475569;font-size:15px;margin:0 0 8px;">Hi ${name},</p>
                    <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">${subject}</h2>
                    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">${body}</p>
                    <hr style="border:none;border-top:1px solid #e8ebed;margin:24px 0;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">You are receiving this because you are a registered resident. Manage your notification preferences in your NestMate profile.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 48px;background:#f8fafc;border-radius:0 0 8px 8px;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} NestMate. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    return true;
  } catch (err) {
    console.error("Email notification error:", err.message);
    return false;
  }
};
