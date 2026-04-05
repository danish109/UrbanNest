/**
 * handleMaintenance.controller.js
 *
 * Admin-side maintenance billing system for NestMate.
 * Features:
 *   - Generate monthly bills for all occupied flats (bulk) or a single flat
 *   - View all bills with filters (status, block, month)
 *   - View unpaid/overdue flats
 *   - Mark a bill as paid
 *   - Send payment reminders via Socket + Email + FCM
 *   - Auto-mark overdue bills (can be called via a cron job)
 */

import { Maintenance } from "../models/maintenance.models.js";
import { Houses } from "../models/houses.models.js";
import { Resident } from "../models/residents.models.js";
import {
  sendNotification,
  sendEmailNotification,broadcastNotification
} from "../services/notificationService.js";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Returns "YYYY-MM" for a given Date (defaults to now) */
function toMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Returns a human-readable month label like "June 2025" */
function monthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  return new Date(y, m - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────
// 1. GENERATE MONTHLY BILLS (bulk — all occupied flats)
// ─────────────────────────────────────────────
/**
 * POST /maintenance/generate
 * Body: { amount, dueDate, month? }
 *
 * Generates one bill per occupied flat for the given month.
 * Skips flats that already have a bill for that month (idempotent).
 */
export const generateMonthlyBills = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { amount, dueDate, month } = req.body;

    if (!amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "amount and dueDate are required",
      });
    }

    const monthKey = month || toMonthKey();
    const dueDateObj = new Date(dueDate);

    const io = req.app.get("io"); // ✅ socket instance

    // ✅ Only OCCUPIED houses (IMPORTANT FIX)
    const occupiedHouses = await Resident.find();

    if (!occupiedHouses.length) {
      return res.status(404).json({
        success: false,
        message: "No occupied flats found",
      });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const house of occupiedHouses) {
      try {
        const resident = await Resident.findOne({
          flatNo: house.flatNo,
          block: house.block,
        }).select("_id fullName");

        // ✅ Create bill
        await Maintenance.create({
          flatNo: house.flatNo,
          block: house.block,
          residentId: resident?._id ?? null,
          amount: Number(amount),
          month: monthKey,
          dueDate: dueDateObj,
          status: "UNPAID",
          generatedBy: adminId,
        });

        results.created++;

        // ✅ SEND NOTIFICATION (KEY PART 🔥)
        if (resident?._id) {
          await sendNotification(io, resident._id, {
            title: "Monthly Maintenance Bill Generated",
            message: `Your maintenance bill for ${monthLabel(
              monthKey
            )} of ₹${amount} has been generated. Due date: ${dueDateObj.toDateString()}.`,
            type: "BILL",
            metadata: {
              amount,
              month: monthKey,
              flatNo: house.flatNo,
              block: house.block,
            },
            link: "/resident/bills",
          });
        }

      } catch (err) {
        if (err.code === 11000) {
          results.skipped++;
        } else {
          results.errors.push(
            `${house.flatNo}-${house.block}: ${err.message}`
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bills generated for ${monthLabel(monthKey)}`,
      results,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ─────────────────────────────────────────────
// 2. GENERATE BILL FOR A SINGLE FLAT
// ─────────────────────────────────────────────
/**
 * POST /maintenance/generate-single
 * Body: { flatNo, block, amount, dueDate, month? }
 */
export const generateSingleBill = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { flatNo, block, amount, dueDate, month } = req.body;

    if (!flatNo || !block || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "flatNo, block, amount, and dueDate are required",
      });
    }

    const monthKey = month || toMonthKey();

    const resident = await Resident.findOne({ flatNo, block }).select("_id");

    const bill = await Maintenance.create({
      flatNo,
      block,
      residentId: resident?._id ?? null,
      amount: Number(amount),
      month: monthKey,
      dueDate: new Date(dueDate),
      status: "UNPAID",
      generatedBy: adminId,
    });

    return res.status(201).json({
      success: true,
      message: `Bill created for flat ${flatNo}-${block} (${monthLabel(monthKey)})`,
      bill,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A bill for this flat already exists for the selected month",
      });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 3. GET ALL BILLS (with filters)
// ─────────────────────────────────────────────
/**
 * GET /maintenance/all?status=UNPAID&block=A&month=2025-06
 */
export const getAllBills = async (req, res) => {
  try {
    const { status, block, month, flatNo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (block) filter.block = block;
    if (month) filter.month = month;
    if (flatNo) filter.flatNo = flatNo;

    const bills = await Maintenance.find(filter)
      .populate("residentId", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 4. GET UNPAID / OVERDUE FLATS
// ─────────────────────────────────────────────
/**
 * GET /maintenance/unpaid?month=2025-06
 */
export const getUnpaidBills = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { status: { $in: ["UNPAID", "OVERDUE"] } };
    if (month) filter.month = month;

    const bills = await Maintenance.find(filter)
      .populate("residentId", "fullName email phone")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 5. MARK BILL AS PAID
// ─────────────────────────────────────────────
/**
 * PATCH /maintenance/mark-paid/:billId
 * Body: { paymentMode, transactionId?, notes? }
 */
export const markBillAsPaid = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paymentMode, transactionId, notes } = req.body;

    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        message: "paymentMode is required",
      });
    }

    const bill = await Maintenance.findById(billId).populate(
      "residentId",
      "fullName email phone notifications fcmToken"
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Bill is already marked as paid",
      });
    }

    bill.status = "PAID";
    bill.paidAt = new Date();
    bill.paymentMode = paymentMode;
    if (transactionId) bill.transactionId = transactionId;
    if (notes) bill.notes = notes;
    await bill.save();

    // Notify resident
    const io = req.app.get("io");
    if (bill.residentId) {
      const resident = bill.residentId;
      await sendNotification(io, resident._id, {
        title: "✅ Payment Confirmed",
        message: `Your maintenance payment of ₹${bill.amount} for ${monthLabel(bill.month)} has been recorded.`,
        type: "MAINTENANCE",
        metadata: { billId: bill._id, month: bill.month },
      });

      // Email receipt
      if (resident.notifications?.email) {
        await sendEmailNotification(
          resident.email,
          resident.fullName,
          `Payment Confirmed — ${monthLabel(bill.month)}`,
          `Your maintenance payment of ₹${bill.amount} for ${monthLabel(bill.month)} has been recorded.`,
          "maintenance",
          {
            flatNo: bill.flatNo,
            block: bill.block,
            amount: bill.amount,
            month: monthLabel(bill.month),
            dueDate: bill.dueDate.toLocaleDateString("en-IN"),
            status: "PAID ✅",
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bill marked as paid",
      bill,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 6. SEND PAYMENT REMINDER
// ─────────────────────────────────────────────
/**
 * POST /maintenance/remind/:billId
 * Sends Socket + Email + FCM reminder to the resident of one bill.
 */
export const sendPaymentReminder = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Maintenance.findById(billId).populate(
      "residentId",
      "fullName email phone notifications fcmToken"
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Bill is already paid — reminder not sent",
      });
    }

    if (!bill.residentId) {
      return res.status(400).json({
        success: false,
        message: "No resident linked to this bill",
      });
    }

    const resident = bill.residentId;
    const io = req.app.get("io");

    // Socket + FCM
    await sendNotification(io, resident._id, {
      title: "🔔 Maintenance Due Reminder",
      message: `Your maintenance of ₹${bill.amount} for ${monthLabel(bill.month)} is due on ${bill.dueDate.toLocaleDateString("en-IN")}. Please pay on time.`,
      type: "MAINTENANCE",
      metadata: { billId: bill._id, month: bill.month, amount: bill.amount },
    });

    // Email reminder
    if (resident.notifications?.email) {
      await sendEmailNotification(
        resident.email,
        resident.fullName,
        `⚠️ Maintenance Due — ${monthLabel(bill.month)}`,
        `Your maintenance of ₹${bill.amount} for ${monthLabel(bill.month)} is pending.`,
        "maintenance",
        {
          flatNo: bill.flatNo,
          block: bill.block,
          amount: bill.amount,
          month: monthLabel(bill.month),
          dueDate: bill.dueDate.toLocaleDateString("en-IN"),
          status: bill.status,
        }
      );
    }

    // Update reminderSentAt timestamp
    bill.reminderSentAt = new Date();
    await bill.save();

    return res.status(200).json({
      success: true,
      message: `Reminder sent to ${resident.fullName} (${resident.email})`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 7. BULK REMINDER — ALL UNPAID FOR A MONTH
// ─────────────────────────────────────────────
/**
 * POST /maintenance/remind-all
 * Body: { month }  (e.g. "2025-06")
 *
 * Sends reminder to ALL unpaid/overdue residents for the given month.
 * Ideal to hook into a cron job.
 */
export const sendBulkReminders = async (req, res) => {
  try {
    const { month } = req.body;
    const monthKey = month || toMonthKey();

    const unpaid = await Maintenance.find({
      month: monthKey,
      status: { $in: ["UNPAID", "OVERDUE"] },
    }).populate("residentId", "fullName email phone notifications fcmToken");

    if (!unpaid.length) {
      return res.status(200).json({
        success: true,
        message: `No unpaid bills found for ${monthLabel(monthKey)}`,
        sent: 0,
      });
    }

    const io = req.app.get("io");
    let sent = 0;

    for (const bill of unpaid) {
      if (!bill.residentId) continue;
      const resident = bill.residentId;

      await sendNotification(io, resident._id, {
        title: "🔔 Maintenance Due Reminder",
        message: `Your maintenance of ₹${bill.amount} for ${monthLabel(monthKey)} is due. Please pay before ${bill.dueDate.toLocaleDateString("en-IN")}.`,
        type: "MAINTENANCE",
        metadata: { billId: bill._id, month: monthKey },
      });

      if (resident.notifications?.email) {
        await sendEmailNotification(
          resident.email,
          resident.fullName,
          `⚠️ Maintenance Reminder — ${monthLabel(monthKey)}`,
          `Your maintenance of ₹${bill.amount} for ${monthLabel(monthKey)} is pending.`,
          "maintenance",
          {
            flatNo: bill.flatNo,
            block: bill.block,
            amount: bill.amount,
            month: monthLabel(monthKey),
            dueDate: bill.dueDate.toLocaleDateString("en-IN"),
            status: bill.status,
          }
        );
      }

      bill.reminderSentAt = new Date();
      await bill.save();
      sent++;
    }

    return res.status(200).json({
      success: true,
      message: `Reminders sent for ${monthLabel(monthKey)}`,
      sent,
      total: unpaid.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 8. AUTO-MARK OVERDUE BILLS
// ─────────────────────────────────────────────
/**
 * PATCH /maintenance/mark-overdue
 * Marks all UNPAID bills past their dueDate as OVERDUE.
 * Call this from a daily cron job.
 */
export const markOverdueBills = async (req, res) => {
  try {
    const result = await Maintenance.updateMany(
      { status: "UNPAID", dueDate: { $lt: new Date() } },
      { $set: { status: "OVERDUE" } }
    );

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} bill(s) marked as OVERDUE`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// 9. DELETE A BILL
// ─────────────────────────────────────────────
/**
 * DELETE /maintenance/delete/:billId
 */
export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const result = await Maintenance.findByIdAndDelete(billId);
    if (!result) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }
    return res.status(200).json({ success: true, message: "Bill deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // ✅ Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // ✅ Get socket instance
    const io = req.app.get("io");

    // ✅ Call your service
    const notifications = await broadcastNotification(io, {
      title,
      message,
      type: type || "ANNOUNCEMENT",
    });

    return res.status(200).json({
      success: true,
      message: "Announcement sent to all residents",
      count: notifications.length,
    });

  } catch (error) {
    console.error("Announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};