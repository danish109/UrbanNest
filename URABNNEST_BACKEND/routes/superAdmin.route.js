
import express from "express";

// ── Existing controllers ──────────────────────────────────────────────────────
import {
  handleAllotHouse,
  handleUpdateHouse,
  handleAddHouse,
  handleDeleteOwner,
  handleGetAllHouses
} from "../controllersAdmin/handleHouses.controller.js";

import {
  handleAddGuards,
  handleDeleteGuards,
  handleUpdateGuards,
  handleGetAllGuards
} from "../controllersAdmin/handleGuards.controller.js";

import {
  handleNoticesCreate,
  handleNoticesDelete,
  getAllNotices,
  getAllComplaints,
  resolveComplaints,
  updateComplaintStatus,
} from "../controllersAdmin/handleOthers.controller.js";

import {
  addVendor,
  deleteVendor,
  updateVendor,
  getVendors,
  addService,
  deleteService,
  updateService,
  getService,
} from "../controllersAdmin/handleVendors.controller.js";

// ── New controllers ───────────────────────────────────────────────────────────
import {
  generateMonthlyBills,
  generateSingleBill,
  getAllBills,
  getUnpaidBills,
  markBillAsPaid,
  sendPaymentReminder,
  sendBulkReminders,
  markOverdueBills,
  deleteBill,
  sendAnnouncement
} from "../controllersAdmin/handleMaintenance.controller.js";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerFCMToken,
} from "../controllersAdmin/handleNotifications.controller.js";

// ── Middlewares ───────────────────────────────────────────────────────────────
import {
  verifier,
  verifyAdmin,
} from "../middlewares/verifyCookie.middleware.js";

// ─────────────────────────────────────────────────────────────────────────────
const superAdminRoutes = express.Router();

// ─────────────────────────────────────────────
// HOUSES
// ─────────────────────────────────────────────
superAdminRoutes.post("/houses/allot",  verifier, verifyAdmin, handleAllotHouse);
superAdminRoutes.post("/houses/add",    verifier, verifyAdmin, handleAddHouse);
superAdminRoutes.post("/houses/update", verifier, verifyAdmin, handleUpdateHouse);
superAdminRoutes.post("/houses/delete", verifier, verifyAdmin, handleDeleteOwner);
superAdminRoutes.get("/houses/all", verifier, verifyAdmin, handleGetAllHouses);
// ─────────────────────────────────────────────
// GUARDS
// ─────────────────────────────────────────────
superAdminRoutes.post(  "/guards/add",             verifier, verifyAdmin, handleAddGuards);
superAdminRoutes.patch( "/guards/update/:guardId",verifier, verifyAdmin, handleUpdateGuards);
superAdminRoutes.delete("/guards/delete/:guardId", handleDeleteGuards);
superAdminRoutes.get("/guards",  verifier, verifyAdmin,handleGetAllGuards);
// ─────────────────────────────────────────────
// NOTICES / ANNOUNCEMENTS
// ─────────────────────────────────────────────
superAdminRoutes.post(  "/notices/create",    verifier, verifyAdmin, handleNoticesCreate);
superAdminRoutes.delete("/notices/delete/:id",verifier, verifyAdmin, handleNoticesDelete);
superAdminRoutes.get(   "/notices/show",      verifier, verifyAdmin, getAllNotices);

// ─────────────────────────────────────────────
// COMPLAINTS
// ─────────────────────────────────────────────
superAdminRoutes.get(  "/complaints/get",                   verifier,             getAllComplaints);
superAdminRoutes.post( "/complaints/resolve",               verifier, verifyAdmin, resolveComplaints);
superAdminRoutes.patch("/complaints/update/:complaintId",   verifier, verifyAdmin, updateComplaintStatus);

// ─────────────────────────────────────────────
// VENDORS & SERVICES
// ─────────────────────────────────────────────
superAdminRoutes.post(  "/vendors/add",            verifier, verifyAdmin, addVendor);
superAdminRoutes.delete("/vendors/delete/:id",     verifier, verifyAdmin, deleteVendor);
superAdminRoutes.patch( "/vendors/update/:id",     verifier, verifyAdmin, updateVendor);
superAdminRoutes.get(   "/vendors/get",            verifier,             getVendors);

superAdminRoutes.post(  "/services/add",           verifier, verifyAdmin, addService);
superAdminRoutes.delete("/services/delete/:id",    verifier, verifyAdmin, deleteService);
superAdminRoutes.patch( "/services/update/:id",    verifier, verifyAdmin, updateService);
superAdminRoutes.get(   "/services/get",           verifier,             getService);

// ─────────────────────────────────────────────
// MAINTENANCE BILLING
// ─────────────────────────────────────────────
// Generate bills
superAdminRoutes.post("/maintenance/generate",        verifier, verifyAdmin, generateMonthlyBills);
superAdminRoutes.post("/maintenance/generate-single", verifier, verifyAdmin, generateSingleBill);

// View bills
superAdminRoutes.get("/maintenance/all",     getAllBills);
superAdminRoutes.get("/maintenance/unpaid", verifier, verifyAdmin, getUnpaidBills);

// Update bill status
superAdminRoutes.patch( "/maintenance/mark-paid/:billId",  verifier, verifyAdmin, markBillAsPaid);
superAdminRoutes.patch( "/maintenance/mark-overdue",       verifier, verifyAdmin, markOverdueBills);

// Send reminders
superAdminRoutes.post("/maintenance/remind/:billId", verifier, verifyAdmin, sendPaymentReminder);
superAdminRoutes.post("/maintenance/remind-all",     verifier, verifyAdmin, sendBulkReminders);
superAdminRoutes.post("/broadcast", sendAnnouncement);

// Delete bill
superAdminRoutes.delete("/maintenance/delete/:billId", verifier, verifyAdmin, deleteBill);

// ─────────────────────────────────────────────
// NOTIFICATION CENTER
// ─────────────────────────────────────────────
// History & counts (admin sees all; residents see own + broadcasts)
superAdminRoutes.get("/notifications",              verifier, getNotifications);
superAdminRoutes.get("/notifications/unread-count", verifier, getUnreadCount);

// Mark as read
superAdminRoutes.patch("/notifications/read-all",        verifier, markAllAsRead);
superAdminRoutes.patch("/notifications/read/:notificationId", verifier, markAsRead);

// Delete (admin only)
superAdminRoutes.delete("/notifications/delete/:notificationId", verifier, verifyAdmin, deleteNotification);

// FCM device token registration (resident calls this from mobile)
superAdminRoutes.post("/notifications/register-token", verifier, registerFCMToken);

export { superAdminRoutes };