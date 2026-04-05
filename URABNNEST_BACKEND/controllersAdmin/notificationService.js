/**
 * notificationService.js
 *
 * Centralised notification layer for NestMate.
 * Handles:
 *   - Socket.IO real-time delivery
 *   - Notification history persistence (Notification model)
 *   - Nodemailer email delivery
 *   - Firebase Cloud Messaging (FCM) push notifications
 */

import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { Notification } from "../models/notification.models.js";
import { Resident } from "../models/residents.models.js";

// ─────────────────────────────────────────────
// 1.  NODEMAILER TRANSPORTER
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // e.g. nestmate.society@gmail.com
    pass: process.env.EMAIL_PASS,   // App password (not account password)
  },
});

// ─────────────────────────────────────────────
// 2.  FIREBASE ADMIN INIT (lazy, once)
// ─────────────────────────────────────────────
let fcmReady = false;
try {
  if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    fcmReady = true;
    console.log("✅ Firebase Admin initialised");
  }
} catch (err) {
  console.warn("⚠️  Firebase Admin init failed — FCM disabled:", err.message);
}

// ─────────────────────────────────────────────
// 3.  INTERNAL HELPERS
// ─────────────────────────────────────────────

/**
 * Persist a notification record to MongoDB.
 * Returns the saved document (or null on failure — never throws).
 */
async function _persistNotification({
  recipientId = null,
  isBroadcast = false,
  title,
  message,
  type = "GENERAL",
  metadata = {},
  channels = {},
}) {
  try {
    return await Notification.create({
      recipientId,
      isBroadcast,
      title,
      message,
      type,
      metadata,
      channels: {
        socket: channels.socket ?? false,
        email: channels.email ?? false,
        fcm: channels.fcm ?? false,
      },
    });
  } catch (err) {
    console.error("❌ Failed to persist notification:", err.message);
    return null;
  }
}

/**
 * Emit a Socket.IO event to a specific resident's room.
 * Rooms are keyed by residentId string.
 */
function _socketEmitToResident(io, residentId, payload) {
  if (!io) return false;
  try {
    io.to(String(residentId)).emit("notification", payload);
    return true;
  } catch (err) {
    console.error("❌ Socket emit failed:", err.message);
    return false;
  }
}

/**
 * Send an FCM push notification to a single FCM token.
 * Silently skips if FCM is not initialised or token is missing.
 */
async function _sendFCM(fcmToken, title, body, data = {}) {
  if (!fcmReady || !fcmToken) return false;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });
    return true;
  } catch (err) {
    console.error("❌ FCM send failed:", err.message);
    return false;
  }
}

// ─────────────────────────────────────────────
// 4.  PUBLIC API
// ─────────────────────────────────────────────

/**
 * sendNotification
 * ─────────────────
 * Delivers a notification to ONE resident via:
 *   • Socket.IO (real-time)
 *   • FCM push (if resident has an fcmToken stored)
 *   • Persists to Notification collection
 *
 * @param {object} io          - Socket.IO server instance
 * @param {string} residentId  - Mongoose ObjectId of the target resident
 * @param {object} payload     - { title, message, type, metadata }
 */
export const sendNotification = async (io, residentId, payload) => {
  const { title, message, type = "GENERAL", metadata = {} } = payload;

  // Look up resident for FCM token
  let fcmToken = null;
  try {
    const resident = await Resident.findById(residentId).select("fcmToken");
    fcmToken = resident?.fcmToken ?? null;
  } catch (_) {}

  const socketOk = _socketEmitToResident(io, residentId, {
    title,
    message,
    type,
    metadata,
    createdAt: new Date(),
  });

  const fcmOk = await _sendFCM(fcmToken, title, message, { type, ...metadata });

  await _persistNotification({
    recipientId: residentId,
    isBroadcast: false,
    title,
    message,
    type,
    metadata,
    channels: { socket: socketOk, fcm: fcmOk, email: false },
  });
};

/**
 * broadcastNotification
 * ──────────────────────
 * Delivers a notification to ALL residents via:
 *   • Socket.IO broadcast (namespace: /notifications)
 *   • FCM multicast (all stored tokens, batched by 500)
 *   • One broadcast Notification record persisted
 *
 * @param {object} io      - Socket.IO server instance
 * @param {object} payload - { title, message, type, metadata }
 */
export const broadcastNotification = async (io, payload) => {
  const { title, message, type = "GENERAL", metadata = {} } = payload;

  // Socket broadcast to everyone
  let socketOk = false;
  if (io) {
    try {
      io.emit("notification", { title, message, type, metadata, createdAt: new Date() });
      socketOk = true;
    } catch (err) {
      console.error("❌ Broadcast socket emit failed:", err.message);
    }
  }

  // FCM multicast — collect all tokens in batches of 500
  let fcmOk = false;
  if (fcmReady) {
    try {
      const residents = await Resident.find({ fcmToken: { $exists: true, $ne: null } }).select("fcmToken");
      const tokens = residents.map((r) => r.fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        // FCM allows max 500 tokens per multicast
        for (let i = 0; i < tokens.length; i += 500) {
          const batch = tokens.slice(i, i + 500);
          await admin.messaging().sendEachForMulticast({
            tokens: batch,
            notification: { title, body: message },
            data: { type, ...Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, String(v)])) },
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } },
          });
        }
        fcmOk = true;
      }
    } catch (err) {
      console.error("❌ FCM multicast failed:", err.message);
    }
  }

  await _persistNotification({
    isBroadcast: true,
    title,
    message,
    type,
    metadata,
    channels: { socket: socketOk, fcm: fcmOk, email: false },
  });
};

/**
 * sendEmailNotification
 * ──────────────────────
 * Sends a styled HTML email via Nodemailer.
 * Never throws — logs errors silently.
 *
 * @param {string} toEmail
 * @param {string} toName
 * @param {string} subject
 * @param {string} bodyText    - Plain-text version of the body
 * @param {string} [template]  - Optional: "welcome" | "complaint" | "maintenance" | "visitor"
 * @param {object} [data]      - Template-specific data
 */
export const sendEmailNotification = async (
  toEmail,
  toName,
  subject,
  bodyText,
  template = "general",
  data = {}
) => {
  try {
    const html = buildEmailHTML(template, toName, bodyText, data);

    await transporter.sendMail({
      from: `"NestMate Society" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text: bodyText,
      html,
    });

    console.log(`📧 Email sent → ${toEmail} [${subject}]`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed → ${toEmail}:`, err.message);
    return false;
  }
};

// ─────────────────────────────────────────────
// 5.  EMAIL HTML BUILDER
// ─────────────────────────────────────────────
function buildEmailHTML(template, name, body, data = {}) {
  const brandColor = "#4f46e5"; // Indigo — matches NestMate UI

  const header = `
    <div style="background:${brandColor};padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-family:sans-serif;">🏠 NestMate</h1>
    </div>`;

  const footer = `
    <div style="background:#f9fafb;padding:16px 32px;border-radius:0 0 8px 8px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;font-family:sans-serif;margin:0;">
        This is an automated message from NestMate Society Management.<br/>
        Please do not reply to this email.
      </p>
    </div>`;

  let content = "";

  switch (template) {
    case "welcome":
      content = `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Welcome to <strong>NestMate</strong>! Your account has been created for flat <strong>${data.flatNo}, Block ${data.block}</strong>.</p>
        <p>Your login passkey: <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:16px;">${data.passkey}</code></p>
        <p>Please keep this safe and change it after first login.</p>`;
      break;

    case "complaint":
      content = `
        <p>Hi <strong>${name}</strong>,</p>
        <p>${body}</p>
        ${data.adminComment ? `<blockquote style="border-left:3px solid ${brandColor};padding-left:12px;color:#374151;">${data.adminComment}</blockquote>` : ""}
        <p>You can track your complaint status in the NestMate app.</p>`;
      break;

    case "maintenance":
      content = `
        <p>Hi <strong>${name}</strong>,</p>
        <p>This is a reminder that your maintenance bill for <strong>${data.month}</strong> is due.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Flat</td><td style="padding:8px;">${data.flatNo}, Block ${data.block}</td></tr>
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Amount</td><td style="padding:8px;">₹${data.amount}</td></tr>
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Due Date</td><td style="padding:8px;">${data.dueDate}</td></tr>
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Status</td><td style="padding:8px;color:#ef4444;font-weight:bold;">${data.status}</td></tr>
        </table>
        <p>Please clear the dues before the due date to avoid penalties.</p>`;
      break;

    case "visitor":
      content = `
        <p>Hi <strong>${name}</strong>,</p>
        <p>A visitor has arrived at the gate for your flat.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Visitor Name</td><td style="padding:8px;">${data.visitorName}</td></tr>
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Purpose</td><td style="padding:8px;">${data.purpose}</td></tr>
          <tr><td style="padding:8px;background:#f9fafb;font-weight:bold;">Time</td><td style="padding:8px;">${data.time}</td></tr>
        </table>
        <p>Please contact the security desk if you were not expecting this visitor.</p>`;
      break;

    default:
      content = `<p>Hi <strong>${name}</strong>,</p><p>${body}</p>`;
  }

  return `
    <div style="max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${header}
      <div style="padding:24px 32px;font-family:sans-serif;color:#111827;line-height:1.6;">
        ${content}
      </div>
      ${footer}
    </div>`;
}
