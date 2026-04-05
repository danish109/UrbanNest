/**
 * Analytics Dashboard
 * Stats for admin: visitors, residents, complaints, maintenance
 */
import { Visitors } from "../models/visitors.model.js";
import { Resident } from "../models/residents.models.js";
import { Complaints } from "../models/complaints.models.js";
import { Notices } from "../models/notices.models.js";
import mongoose from "mongoose";

// GET /analytics/dashboard — full admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // ---- Residents ----
    const totalResidents = await Resident.countDocuments({ role: "RESIDENT" });
    const activeResidents = await Resident.countDocuments({ role: "RESIDENT", isActive: true });

    // ---- Visitors ----
    const visitorsToday = await Visitors.countDocuments({ createdAt: { $gte: startOfToday } });
    const visitorsThisMonth = await Visitors.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Visitor trend (last 7 days grouped by date)
    const visitorTrend = await Visitors.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    // ---- Complaints ----
    const totalComplaints = await Complaints.countDocuments();
    const openComplaints = await Complaints.countDocuments({ status: "OPEN" });
    const inProgressComplaints = await Complaints.countDocuments({ status: "IN_PROGRESS" });
    const resolvedComplaints = await Complaints.countDocuments({ status: "RESOLVED" });

    // Complaints by priority
    const complaintsByPriority = await Complaints.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { priority: "$_id", count: 1, _id: 0 } },
    ]);

    // Complaints by category
    const complaintsByCategory = await Complaints.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);

    // ---- Notices ----
    const activeNotices = await Notices.countDocuments({
      expiry: { $gte: new Date().toISOString() },
    });

    // ---- Security ----
    const currentlyInsideVisitors = await Visitors.countDocuments({ status: "CHECKED_IN" });
    const pendingApprovals = await Visitors.countDocuments({ status: "PENDING" });

    // Visitor status breakdown (for security dashboard)
    const visitorStatusBreakdown = await Visitors.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        residents: { total: totalResidents, active: activeResidents },
        visitors: {
          today: visitorsToday,
          thisMonth: visitorsThisMonth,
          currentlyInside: currentlyInsideVisitors,
          pendingApprovals,
          trend: visitorTrend,
          statusBreakdown: visitorStatusBreakdown,
        },
        complaints: {
          total: totalComplaints,
          open: openComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          byPriority: complaintsByPriority,
          byCategory: complaintsByCategory,
          resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
        },
        notices: { active: activeNotices },
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// GET /analytics/security — security guard dashboard
export const getSecurityStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVisitors = await Visitors.find({ createdAt: { $gte: startOfToday } })
      .populate("resident", "fullName flatNo block")
      .sort({ createdAt: -1 })
      .limit(20);

    const pendingApprovals = await Visitors.find({ status: "PENDING" })
      .populate("resident", "fullName flatNo block")
      .sort({ createdAt: -1 });

    const currentlyInside = await Visitors.find({ status: "CHECKED_IN" })
      .populate("resident", "fullName flatNo block")
      .sort({ entryTime: -1 });

    return res.status(200).json({
      success: true,
      data: {
        todayVisitors,
        pendingApprovals,
        currentlyInside,
        counts: {
          todayTotal: todayVisitors.length,
          pendingCount: pendingApprovals.length,
          insideCount: currentlyInside.length,
        },
      },
    });
  } catch (error) {
    console.error("Security Stats Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /analytics/resident — resident-facing dashboard data
export const getResidentDashboard = async (req, res) => {
  try {
    const residentId = req.user.id;

    const myVisitors = await Visitors.find({ resident: residentId })
      .sort({ createdAt: -1 })
      .limit(5);

    const myComplaints = await Complaints.find({ residentId })
      .sort({ createdAt: -1 })
      .limit(5);

    const openComplaintsCount = await Complaints.countDocuments({ residentId, status: { $in: ["OPEN", "IN_PROGRESS"] } });

    const recentNotices = await Notices.find().sort({ createdAt: -1 }).limit(3);

    const pendingVisitorApprovals = await Visitors.countDocuments({
      resident: residentId,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        recentVisitors: myVisitors,
        recentComplaints: myComplaints,
        recentNotices,
        counts: {
          openComplaints: openComplaintsCount,
          pendingVisitors: pendingVisitorApprovals,
          totalVisitorsEver: await Visitors.countDocuments({ resident: residentId }),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
