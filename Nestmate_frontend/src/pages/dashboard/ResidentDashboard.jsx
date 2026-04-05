import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import { formatDistanceToNow, format } from "date-fns";
import logo from "../../assets/logo5.png";
import ResidentChat from "../../components/ResidentChat";
import {
  FaHome,
  FaBell,
  FaTools,
  FaChartLine,
  FaSignOutAlt,
  FaSearch,
  FaPlus,
  FaTrash,
  FaExclamationCircle,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaUserCircle,
  FaPaperPlane,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
  FaQrcode,
  FaStore,
  FaShieldAlt,
  FaEdit,
  FaThumbsUp,
  FaCommentAlt,
  FaDownload,
  FaStar,
  FaCamera,
  FaBuilding,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdApartment, MdDashboard, MdPayment } from "react-icons/md";
import { IoChatbubblesOutline } from "react-icons/io5";
import QRCode from "qrcode";

const BASE = "http://localhost:8000";
const socket = io("http://localhost:5000"); // ✅ ADD THIS

// ─── Color Maps ──────────────────────────────────────────────────────────────
const PriorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-purple-100 text-purple-800",
};
const StatusColors = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-gray-100 text-gray-800",
  EXPIRED: "bg-gray-100 text-gray-800",
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  refunded: "bg-purple-100 text-purple-800",
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-red-100 text-red-800",
};
const NotifTypeBadgeColors = {
  VISITOR: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-orange-100 text-orange-800",
  ANNOUNCEMENT: "bg-purple-100 text-purple-800",
  COMPLAINT: "bg-red-100 text-red-800",
  GENERAL: "bg-gray-100 text-gray-800",
  BILL: "bg-yellow-100 text-yellow-800",
  EMERGENCY: "bg-red-200 text-red-900",
  OTHER: "bg-gray-100 text-gray-800",
};

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Reusable Components ─────────────────────────────────────────────────────
const DashboardCard = ({ title, value, icon, color, delay = 0, sub }) => (
  <motion.div
    className={`p-4 sm:p-6 rounded-2xl shadow-lg bg-gradient-to-r ${color} text-white flex items-center justify-between relative overflow-hidden group cursor-pointer`}
    whileHover={{ scale: 1.02, y: -3, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <p className="text-xs sm:text-sm font-medium opacity-90 mb-1">{title}</p>
      <motion.h3
        className="text-xl sm:text-3xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
      >
        {value}
      </motion.h3>
      {sub && <p className="text-xs opacity-75 mt-1">{sub}</p>}
    </div>
    <motion.div
      className="p-2 sm:p-4 rounded-full bg-white/20 backdrop-blur-sm relative z-10"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
    >
      {icon}
    </motion.div>
  </motion.div>
);

const Modal = ({ open, onClose, title, children, wide }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white/95 backdrop-blur-xl p-4 sm:p-8 rounded-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0e2a4a]">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FaTimes className="text-gray-500" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InputField = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-2 text-gray-700">{label}</label>}
    <input
      className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all text-sm sm:text-base"
      {...props}
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-2 text-gray-700">{label}</label>}
    <select
      className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all text-sm sm:text-base"
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const GoldBtn = ({ children, className = "", ...props }) => (
  <motion.button
    className={`px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base ${className}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    {...props}
  >
    {children}
  </motion.button>
);

const RedBtn = ({ children, className = "", ...props }) => (
  <motion.button
    className={`px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 text-xs sm:text-sm transition-all duration-300 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
);

const DataTable = ({ title, columns, data, emptyIcon, emptyText }) => (
  <motion.div
    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {title && (
      <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-[#0e2a4a] to-[#1a4b7a]">
        <h3 className="font-bold text-lg sm:text-xl text-white">{title}</h3>
      </div>
    )}
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-gray-400">
          <div className="text-4xl sm:text-5xl mb-3">{emptyIcon || "📭"}</div>
          <p className="text-sm sm:text-base">{emptyText || "No data found"}</p>
        </div>
      ) : (
        <table className="min-w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {data.map((row, ri) => (
              <motion.tr
                key={ri}
                className="hover:bg-gray-50/50 transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ri * 0.04 }}
              >
                {columns.map((col, ci) => (
                  <td key={ci} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                    {row[col.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </motion.div>
);

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} onClick={() => onChange(s)} className={`text-xl sm:text-2xl transition-colors ${s <= value ? "text-[#ffb703]" : "text-gray-300 hover:text-[#ffb703]"}`}>
        <FaStar />
      </button>
    ))}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Reduced for mobile

  // Data states
  const [profile, setProfile] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [services, setServices] = useState([]);
  const [billables, setBillables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [qrPasses, setQrPasses] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Modal states
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [complaintModal, setComplaintModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [notifDetailModal, setNotifDetailModal] = useState(null);
  const [commentModal, setCommentModal] = useState(null);
  const [rateModal, setRateModal] = useState(null);
  const [profileEditModal, setProfileEditModal] = useState(false);
  const [viewComplaintModal, setViewComplaintModal] = useState(null);
  const [serviceDetailModal, setServiceDetailModal] = useState(null);

  // Form states
  const [complaintForm, setComplaintForm] = useState({ title: "", description: "", nature: "PUBLIC", priority: "MEDIUM", category: "OTHER" });
  const [qrForm, setQrForm] = useState({ fullName: "", phone: "", visitorFor: "", purpose: "", expectedDate: "" });
  const [commentText, setCommentText] = useState("");
  const [ratingVal, setRatingVal] = useState(0);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", alternatePhone: "", bio: "", occupation: "", numberOfMembers: "", dateOfBirth: "" });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, visitor: true, maintenance: true, announcements: true });

  // Mouse parallax
  useEffect(() => {
    const h = (e) => setMousePosition({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // ─── API Helper ──────────────────────────────────────────────────────────────
  const api = useCallback(async (method, url, data = null) => {
    const config = { withCredentials: true };
    if (method === "get") return axios.get(`${BASE}${url}`, config);
    if (method === "post") return axios.post(`${BASE}${url}`, data, config);
    if (method === "put") return axios.put(`${BASE}${url}`, data, config);
    if (method === "patch") return axios.patch(`${BASE}${url}`, data, config);
    if (method === "delete") return axios.delete(`${BASE}${url}`, config);
  }, []);

  // ─── Fetch functions ─────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const r = await api("get", "/profile");
      if (r.data.success) {
        setProfile(r.data.profile);
        const p = r.data.profile;
        setProfileForm({ fullName: p.fullName || "", phone: p.phone || "", alternatePhone: p.alternatePhone || "", bio: p.bio || "", occupation: p.occupation || "", numberOfMembers: p.numberOfMembers || "", dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "" });
        if (p.notifications) setNotifPrefs(p.notifications);
      }
    } catch { toast.error("Failed to load profile"); }
  };

  const fetchVisitors = async () => {
    try {
      const r = await api("get", "/resident/getVisitor");
      if (r.data.success) setVisitors(r.data.visitorsData || []);
    } catch { setVisitors([]); }
  };

  const fetchNotices = async () => {
    try {
      const r = await api("get", "/resident/getNotices");
      if (r.data.success) setNotices(r.data.notice || []);
    } catch { setNotices([]); }
  };

  const fetchComplaints = async () => {
    try {
      const r = await api("get", "/resident/getComplaint");
      if (r.data.success) setComplaints(r.data.complaintsAll || []);
    } catch { setComplaints([]); }
  };

  const fetchServices = async () => {
    try {
      const r = await api("get", "/resident/getService");
      if (r.data.success) setServices(r.data.services || []);
    } catch { setServices([]); }
  };

  const fetchBillables = async () => {
    try {
      const r = await api("get", "/resident/seeBillables");
      if (r.data.success) setBillables(r.data.service || []);
    } catch { setBillables([]); }
  };

  const fetchNotifications = async () => {
    try {
      const r = await api("get", "/notifications");
      if (r.data.success) {
        setNotifications(r.data.notifications || []);
        setUnreadCount(r.data.unreadCount || 0);
      }
    } catch { }
  };

  const fetchQrPasses = async () => {
    try {
      const r = await api("get", "/qr/my-passes");
      if (r.data.success) setQrPasses(r.data.passes || []);
    } catch { setQrPasses([]); }
  };

  const fetchPaymentHistory = async () => {
    try {
      const r = await api("get", "/payment1/history");
      if (r.data.success) setPaymentHistory(r.data.data || []);
    } catch { setPaymentHistory([]); }
  };
  useEffect(() => {
  socket.on("visitorDecision", (data) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v._id === data.visitorId ? { ...v, status: data.status } : v
      )
    );

    toast.info(data.message);
  });

  return () => socket.off("visitorDecision");
}, []);

  // Tab-based loading
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        switch (activeTab) {
          case "dashboard": await Promise.all([fetchProfile(), fetchNotices(), fetchComplaints(), fetchVisitors()]); break;
          case "profile": await fetchProfile(); break;
          case "visitors": await fetchVisitors(); break;
          case "notices": await fetchNotices(); break;
          case "complaints": await fetchComplaints(); break;
          case "services": await fetchServices(); break;
          case "billables": await fetchBillables(); break;
          case "notifications": await fetchNotifications(); break;
          case "qr": await fetchQrPasses(); break;
          case "payments": await fetchPaymentHistory(); break;
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────


  const handleVisitorAction = async (visitorId, action) => {
  try {
    const res = await axios.patch(
      `${BASE}/guard/visitor/approve/${visitorId}`, // ⚠️ adjust route
      { action },
      { withCredentials: true }
    );

    if (res.data.success) {
      toast.success(`Visitor ${action.toLowerCase()}d`);
      fetchVisitors(); // refresh UI
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Action failed");
  }
};
  const handleLogout = async () => {
    try {
      await api("post", "/user/resident/logout");
      localStorage.removeItem("resident");
      toast.success("Logged out");
      navigate("/login/resident");
    } catch { toast.error("Logout failed"); }
  };

  const handleCreateComplaint = async () => {
    if (!complaintForm.title || !complaintForm.description || !complaintForm.nature) {
      return toast.error("Title, description and nature are required");
    }
    try {
      const r = await api("post", "/resident/createComplaint", complaintForm);
      if (r.data.success) {
        toast.success("Complaint submitted!");
        setComplaintModal(false);
        setComplaintForm({ title: "", description: "", nature: "PUBLIC", priority: "MEDIUM", category: "OTHER" });
        fetchComplaints();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleUpvote = async (id) => {
    try {
      const r = await api("post", `/resident/upvoteComplaint/${id}`);
      if (r.data.success) { toast.success("Upvoted!"); fetchComplaints(); }
    } catch { toast.error("Failed to upvote"); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      const r = await api("post", `/resident/complaint/${commentModal._id}/comment`, { text: commentText });
      if (r.data.success) {
        toast.success("Comment added");
        setCommentModal(null);
        setCommentText("");
        fetchComplaints();
      }
    } catch { toast.error("Failed"); }
  };

  const handleRateService = async () => {
    if (!ratingVal) return toast.error("Please select a rating");
    try {
      const r = await api("post", `/resident/rateVendor/${rateModal._id}`, { rating: ratingVal });
      if (r.data.success) { toast.success("Rating submitted!"); setRateModal(null); setRatingVal(0); fetchServices(); }
    } catch { toast.error("Failed"); }
  };

  const handleAddToBill = async (serviceId) => {
    try {
      const r = await api("post", `/resident/addToBill/${serviceId}`, { units: 1 });
      if (r.data.success) { toast.success("Added to your bill"); fetchBillables(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteFromBill = async (billableId) => {
    if (!window.confirm("Remove from bill?")) return;
    try {
      const r = await api("delete", `/resident/deleteFromBill/${billableId}`);
      if (r.data.success) { toast.success("Removed"); fetchBillables(); }
    } catch { toast.error("Failed"); }
  };

  const handleGenerateQR = async () => {
    if (!qrForm.fullName || !qrForm.phone || !qrForm.visitorFor) {
      return toast.error("Name, phone and purpose are required");
    }
    try {
      const r = await api("post", "/qr/generate", qrForm);
      if (r.data.success) {
        const pass = r.data.pass;
        setGeneratedPass(pass);
        const qrDataUrl = await QRCode.toDataURL(pass.qrToken, { width: 256, margin: 2, color: { dark: "#0e2a4a", light: "#ffffff" } });
        setQrImageUrl(qrDataUrl);
        toast.success("QR Pass generated!");
        fetchQrPasses();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api("patch", "/notifications/read-all");
      toast.success("All marked as read");
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api("patch", `/notifications/${id}/read`);
      fetchNotifications();
    } catch { }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api("delete", `/notifications/${id}`);
      toast.success("Deleted");
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const handleUpdateProfile = async () => {
    try {
      const r = await api("patch", "/profile/update", profileForm);
      if (r.data.success) { toast.success("Profile updated"); fetchProfile(); setProfileEditModal(false); }
    } catch { toast.error("Update failed"); }
  };

  const handleUpdateNotifPrefs = async () => {
    try {
      const r = await api("patch", "/profile/notifications", notifPrefs);
      if (r.data.success) toast.success("Preferences saved");
    } catch { toast.error("Failed"); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const r = await axios.patch(`${BASE}/profile/photo`, formData, { withCredentials: true });
      if (r.data.success) { toast.success("Photo updated"); fetchProfile(); }
    } catch { toast.error("Upload failed"); }
  };

  // ─── Pagination & Search ──────────────────────────────────────────────────────
  const search = (arr, keys) => arr.filter((item) =>
    keys.some((k) => String(item[k] || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginate = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const PaginationControls = ({ total }) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <motion.div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <motion.button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
        >
          <FaChevronLeft className="text-xs sm:text-sm" /> Previous
        </motion.button>
        <div className="flex flex-wrap justify-center items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
            <motion.button key={p} onClick={() => setCurrentPage(p)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 ${currentPage === p ? "bg-[#0e2a4a] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>{p}</motion.button>
          ))}
        </div>
        <motion.button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
        >
          Next <FaChevronRight className="text-xs sm:text-sm" />
        </motion.button>
      </motion.div>
    );
  };

  const formatDate = (d) => { if (!d) return "N/A"; const dt = new Date(d); return isNaN(dt) ? "N/A" : format(dt, "dd MMM yyyy"); };

  // Sidebar items
  const sidebarItems = [
    { key: "dashboard", icon: MdDashboard, label: "Dashboard" },
    { key: "profile", icon: FaUserCircle, label: "My Profile" },
    { key: "visitors", icon: FaShieldAlt, label: "Visitors" },
    { key: "qr", icon: FaQrcode, label: "QR Passes" },
    { key: "notices", icon: FaBell, label: "Notices" },
    { key: "complaints", icon: FaExclamationCircle, label: "Complaints" },
    { key: "services", icon: FaTools, label: "Services" },
    { key: "billables", icon: FaMoneyBillWave, label: "My Bills" },
    { key: "payments", icon: MdPayment, label: "Payments" },
    { key: "notifications", icon: FaBell, label: "Notifications" },
    { key: "chat", icon: IoChatbubblesOutline, label: "Community Chat" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <ToastContainer position="top-right" theme="light" autoClose={3000} />

      {/* Floating BG elements - hidden on mobile for performance */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#0e2a4a]/10 to-[#ffb703]/10 rounded-full blur-3xl"
          animate={{ x: mousePosition.x * 20, y: mousePosition.y * 20 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#ffb703]/10 to-[#0e2a4a]/10 rounded-full blur-3xl"
          animate={{ x: mousePosition.x * -15, y: mousePosition.y * -15 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      {/* Navbar */}
      <motion.nav
        className="bg-[#0e2a4a] text-white shadow-2xl relative z-50 backdrop-blur-xl border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-8xl px-4 sm:px-8 py-3 flex justify-between items-center">
          <motion.div className="flex items-center gap-2 sm:gap-4" whileHover={{ scale: 1.02 }}>
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-[#ffb703] to-[#0e2a4a] flex items-center justify-center">
               <img
                                         src={logo}
                                         alt="UrbanNest"
                                         className="w-full h-full object-cover"
                                       />
              </div>
              <motion.span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide" whileHover={{ scale: 1.05 }}>
                UrbanNest
              </motion.span>
              <span className="hidden md:block px-2 sm:px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-widest border border-teal-500/30">
                Resident
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} className="relative p-2 rounded-full hover:bg-[#ffb703]/20 transition">
                <FaBell className="text-lg sm:text-xl text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-black rounded-xl shadow-xl p-4 z-50">
                  <h4 className="font-bold mb-2">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div key={n._id} className={`border-b py-2 text-sm cursor-pointer hover:bg-gray-50 ${!n.isRead ? "font-semibold" : ""}`}>
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-gray-500 text-xs truncate">{n.message}</p>
                      </div>
                    ))
                  )}
                  <button onClick={() => { setActiveTab("notifications"); setNotifOpen(false); }} className="mt-2 text-blue-500 text-sm">
                    View All →
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2">
                <img src={profile?.profilePhoto?.url || "https://api.dicebear.com/7.x/initials/svg?seed=" + (profile?.fullName || "R")} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-teal-400 object-cover" alt="avatar" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-xl shadow-xl p-4 z-50">
                  <div className="mb-3">
                    <p className="font-semibold text-sm sm:text-base">{profile?.fullName || "Resident"}</p>
                    <p className="text-xs text-gray-900">{profile?.email}</p>
                    <p className="text-xs text-teal-600 mt-1">Flat {profile?.block}-{profile?.flatNo}</p>
                  </div>
                  <hr />
                  <button onClick={() => { setActiveTab("profile"); setProfileOpen(false); }} className="w-full text-left py-2 text-sm hover:text-[#ffb703]">
                    View Profile
                  </button>
                </div>
              )}
            </div>

            

            <motion.button onClick={handleLogout} className="flex items-center px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-sm sm:text-base" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FaSignOutAlt className="mr-2" /> Logout
            </motion.button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <motion.button onClick={() => setMobileOpen(!mobileOpen)} whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <FaTimes className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <FaBars className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="md:hidden bg-[#0e2a4a] px-4 pb-4 space-y-3 border-t border-[#1a4b7a]" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setMobileOpen(false); }}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 font-medium ${activeTab === item.key ? "bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a]" : "text-white hover:bg-white/10"}`}
                >
                  <item.icon className="mr-3 text-base" />
                  {item.label}
                </motion.button>
              ))}
              <motion.button onClick={handleLogout} className="flex items-center w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white" whileHover={{ scale: 1.02 }}>
                <FaSignOutAlt className="mr-2" /> Logout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <motion.div
          className="hidden lg:block w-64 h-full overflow-y-auto bg-white/80 backdrop-blur-xl text-[#0e2a4a] shadow-2xl border-r border-white/20 relative z-10"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="p-6 border-b border-gray-200/50">
            <motion.h1 className="text-xl font-bold flex items-center text-[#0e2a4a]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <FaHome className="mr-3 text-teal-500" /> Resident Portal
            </motion.h1>
            <motion.div className="mt-3 flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <img src={profile?.profilePhoto?.url || "https://api.dicebear.com/7.x/initials/svg?seed=" + (profile?.fullName || "R")} className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover" alt="avatar" />
              <div>
                <p className="text-sm font-semibold text-[#0e2a4a] truncate w-32">{profile?.fullName?.split(" ")[0] || "Resident"}</p>
                <p className="text-xs text-teal-600">Flat {profile?.block || "—"}-{profile?.flatNo || "—"}</p>
              </div>
            </motion.div>
          </div>

          <nav className="p-4">
            <motion.ul className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
              {sidebarItems.map((item) => (
                <motion.li key={item.key} variants={itemVariants}>
                  <motion.button
                    onClick={() => { setActiveTab(item.key); setMobileOpen(false); setSearchTerm(""); }}
                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 font-medium ${activeTab === item.key ? "bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] shadow-lg" : "hover:bg-white/50 hover:shadow-md text-gray-700"}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="mr-3 text-lg" />
                    {item.label}
                    {item.key === "notifications" && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
          </nav>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-auto relative z-10">
          {/* Header */}
          <motion.header className="bg-white/80 backdrop-blur-xl shadow-sm p-4 sm:p-6 border-b border-gray-200/50" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h2 className="text-xl sm:text-2xl font-bold capitalize text-[#0e2a4a]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                {sidebarItems.find((s) => s.key === activeTab)?.label || "Dashboard"}
              </motion.h2>
              {activeTab !== "dashboard" && activeTab !== "profile" && (
                <motion.div className="relative w-full sm:w-80" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all shadow-sm text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                </motion.div>
              )}
            </div>
          </motion.header>

          <main className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="flex justify-center items-center h-64" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="flex flex-col items-center gap-4" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ffb703]/30 border-t-[#ffb703] rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium text-sm sm:text-base">Loading...</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>

                  {/* ─── DASHBOARD ─────────────────────────────────── */}
                  {activeTab === "dashboard" && (
                    <>
                      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8" variants={containerVariants} initial="hidden" animate="visible">
                        <DashboardCard title="My Visitors" value={visitors.filter(v => v.status === "PENDING").length}
 icon={<FaShieldAlt className="text-xl sm:text-2xl" />} color="from-blue-500 to-blue-600" delay={0} sub="Total logged" />
                        <DashboardCard title="Active Notices" value={notices.filter(n => new Date(n.expiry) > new Date()).length} icon={<FaBell className="text-xl sm:text-2xl" />} color="from-purple-500 to-purple-600" delay={0.1} sub="Unread alerts" />
                        <DashboardCard title="My Complaints" value={complaints.filter(c => c.residentId?._id === profile?._id || c.nature === "PUBLIC").length} icon={<FaExclamationCircle className="text-xl sm:text-2xl" />} color="from-orange-500 to-orange-600" delay={0.2} sub="Filed issues" />
                        <DashboardCard title="Notifications" value={unreadCount} icon={<FaBell className="text-xl sm:text-2xl" />} color="from-red-500 to-red-600" delay={0.3} sub="Unread messages" />
                      </motion.div>

                      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        {/* Recent Notices */}
                        <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">Recent Notices</h3>
                            <button onClick={() => setActiveTab("notices")} className="text-xs sm:text-sm text-teal-600 hover:underline">View All →</button>
                          </div>
                          {notices.slice(0, 4).map((n) => (
                            <div key={n._id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.category === "EMERGENCY" ? "bg-red-500" : n.category === "EVENT" ? "bg-green-500" : "bg-yellow-500"}`} />
                              <div>
                                <p className="font-semibold text-xs sm:text-sm text-[#0e2a4a]">{n.title}</p>
                                <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                              </div>
                            </div>
                          ))}
                          {notices.length === 0 && <p className="text-gray-400 text-center py-8">No notices</p>}
                        </motion.div>

                        {/* Recent Visitors */}
                        <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">Recent Visitors</h3>
                            <button onClick={() => setActiveTab("visitors")} className="text-xs sm:text-sm text-teal-600 hover:underline">View All →</button>
                          </div>
                          {visitors.slice(0, 4).map((v) => (
                            <div key={v._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-2">
                              <div>
                                <p className="font-semibold text-xs sm:text-sm text-[#0e2a4a]">{v.fullName}</p>
                                <p className="text-xs text-gray-500">{v.purpose} · {formatDate(v.createdAt)}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full self-start sm:self-center ${StatusColors[v.status] || "bg-gray-100 text-gray-800"}`}>{v.status}</span>
                            </div>
                          ))}
                          {visitors.length === 0 && <p className="text-gray-400 text-center py-8">No visitors yet</p>}
                        </motion.div>
                      </div>

                      {/* Quick Actions */}
                      <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          {[
                            { label: "File Complaint", icon: FaExclamationCircle, action: () => setComplaintModal(true), color: "from-red-400 to-red-500" },
                            { label: "Generate QR Pass", icon: FaQrcode, action: () => { setActiveTab("qr"); setTimeout(() => setQrModal(true), 100); }, color: "from-teal-400 to-teal-500" },
                            { label: "View Services", icon: FaTools, action: () => setActiveTab("services"), color: "from-blue-400 to-blue-500" },
                            { label: "My Bills", icon: FaMoneyBillWave, action: () => setActiveTab("billables"), color: "from-[#ffb703] to-[#ffa502]" },
                          ].map((a) => (
                            <motion.button key={a.label} onClick={a.action}
                              className={`p-3 sm:p-5 bg-gradient-to-br ${a.color} text-white rounded-2xl flex flex-col items-center gap-2 sm:gap-3 hover:shadow-xl transition-all`}
                              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                              <a.icon className="text-xl sm:text-2xl" />
                              <span className="text-xs sm:text-sm font-semibold text-center">{a.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* ─── PROFILE ──────────────────────────────────── */}
                  {activeTab === "profile" && profile && (
                    <div className="max-w-3xl mx-auto space-y-6">
                      {/* Header card */}
                      <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="h-20 sm:h-24 bg-gradient-to-r from-[#0e2a4a] to-[#1a4b7a]" />
                        <div className="px-4 sm:px-8 pb-6 sm:pb-8 -mt-10 sm:-mt-12">
                          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 mb-6">
                            <div className="relative">
                              <img src={profile.profilePhoto?.url || "https://api.dicebear.com/7.x/initials/svg?seed=" + profile.fullName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-xl object-cover" alt="profile" />
                              <label className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#ffb703] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#ffa502] transition">
                                <FaCamera className="text-[#0e2a4a] text-[10px] sm:text-xs" />
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                              </label>
                            </div>
                            <div className="flex-1">
                              <h2 className="text-xl sm:text-2xl font-bold text-white">{profile.fullName}</h2>
                              <p className="text-gray-900 text-sm sm:text-base">{profile.email}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">Flat {profile.block}-{profile.flatNo}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${profile.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{profile.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </div>
                            <div className="ml-0 sm:ml-auto mt-4 sm:mt-0">
                              <GoldBtn onClick={() => setProfileEditModal(true)} className="w-full sm:w-auto">
                                <FaEdit className="inline mr-2" /> Edit Profile
                              </GoldBtn>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            {[
                              { icon: FaPhone, label: "Phone", value: profile.phone || "—" },
                              { icon: FaPhone, label: "Alt. Phone", value: profile.alternatePhone || "—" },
                              { icon: FaIdCard, label: "Occupation", value: profile.occupation || "—" },
                              { icon: FaUsers, label: "Family Members", value: profile.numberOfMembers || "—" },
                              { icon: FaCalendarAlt, label: "Date of Birth", value: profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "—" },
                              { icon: FaMapMarkerAlt, label: "Block", value: `${profile.block || "—"} · Flat ${profile.flatNo || "—"}` },
                            ].map((f) => (
                              <div key={f.label} className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                  <f.icon className="text-teal-500 text-xs sm:text-sm" />
                                  <span className="text-xs text-gray-500 font-semibold uppercase">{f.label}</span>
                                </div>
                                <p className="text-sm font-semibold text-[#0e2a4a] break-words">{f.value}</p>
                              </div>
                            ))}
                          </div>
                          {profile.bio && <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-xl"><p className="text-sm text-gray-700 italic">"{profile.bio}"</p></div>}
                        </div>
                      </motion.div>
                      

                      {/* Notification Preferences */}
                      <motion.div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 className="text-base sm:text-lg font-bold text-[#0e2a4a] mb-4 flex items-center gap-2"><FaBell className="text-[#ffb703]" /> Notification Preferences</h3>
                        <div className="space-y-3">
                          {Object.entries(notifPrefs).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-xs sm:text-sm font-medium capitalize text-gray-700">{key} Notifications</span>
                              <button onClick={() => { const updated = { ...notifPrefs, [key]: !val }; setNotifPrefs(updated); }}>
                                {val ? <FaToggleOn className="text-2xl sm:text-3xl text-teal-500" /> : <FaToggleOff className="text-2xl sm:text-3xl text-gray-300" />}
                              </button>
                            </div>
                          ))}
                          <GoldBtn className="mt-4 w-full" onClick={handleUpdateNotifPrefs}>Save Preferences</GoldBtn>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* ─── VISITORS ────────────────────────────────── */}
                  {activeTab === "visitors" && (() => {
                    const filtered = search(visitors, ["fullName", "phone", "status", "purpose"]);
                    return (
                      <>
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6">
                          {filtered.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No visitors</p>
                          ) : (
                            paginate(filtered).map((v) => (
                              <div
                                key={v._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b gap-3"
                              >
                                <div>
                                  <p className="font-semibold text-[#0e2a4a] text-sm sm:text-base">{v.fullName}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {v.purpose} • {formatDate(v.createdAt)}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded ${
                                      StatusColors[v.status] || "bg-gray-100"
                                    }`}
                                  >
                                    {v.status}
                                  </span>

                                  {/* 🔥 BUTTONS */}
                                  {v.status === "PENDING" && (
                                    <>
                                      <button
                                        onClick={() => handleVisitorAction(v._id, "APPROVE")}
                                        className="px-2 sm:px-3 py-1 bg-green-500 text-white rounded text-xs"
                                      >
                                        Approve
                                      </button>

                                      <button
                                        onClick={() => handleVisitorAction(v._id, "REJECT")}
                                        className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded text-xs"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <PaginationControls total={filtered.length} />
                      </>
                    );
                  })()}

                  {/* ─── QR PASSES ───────────────────────────────── */}
                  {activeTab === "qr" && (() => {
                    const filtered = search(qrPasses, ["fullName", "phone", "status", "purpose"]);
                    return (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">QR Visitor Passes ({filtered.length})</h3>
                          <GoldBtn onClick={() => { setQrModal(true); setGeneratedPass(null); setQrImageUrl(null); }}>
                            <FaQrcode className="inline mr-2 text-xs sm:text-sm" /> Generate New Pass
                          </GoldBtn>
                        </div>
                        {filtered.length === 0 ? (
                          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-16 text-center">
                            <FaQrcode className="text-5xl sm:text-6xl mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-medium text-sm sm:text-base">No QR passes generated yet</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Generate a pass for your expected visitors</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {paginate(filtered).map((pass) => (
                              <motion.div key={pass._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                  <div>
                                    <h4 className="font-bold text-[#0e2a4a] text-base sm:text-lg">{pass.fullName}</h4>
                                    <p className="text-gray-500 text-xs sm:text-sm">{pass.phone}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${StatusColors[pass.status] || "bg-gray-100 text-gray-800"}`}>{pass.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">Purpose: <span className="font-semibold text-gray-700">{pass.purpose}</span></p>
                                <p className="text-xs text-gray-500 mb-1">For: <span className="font-semibold text-gray-700">{pass.visitorFor}</span></p>
                                <p className="text-xs text-gray-400 mt-2">Expires: {pass.qrExpiresAt ? formatDate(pass.qrExpiresAt) : "N/A"}</p>
                                <p className="text-xs text-gray-400">Created: {formatDistanceToNow(new Date(pass.createdAt), { addSuffix: true })}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}

                  {/* ─── NOTICES ─────────────────────────────────── */}
                  {activeTab === "notices" && (() => {
                    const filtered = search(notices, ["title", "content", "category"]);
                    return (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-6">Society Notices ({filtered.length})</h3>
                        {filtered.length === 0 ? (
                          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                            <FaBell className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-sm sm:text-base">No notices found</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {paginate(filtered).map((n) => (
                              <motion.div key={n._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${n.category === "EMERGENCY" ? "bg-red-100 text-red-800" : n.category === "EVENT" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{n.category}</span>
                                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-2">{n.title}</h3>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{n.content}</p>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs text-gray-400">Expires: {new Date(n.expiry).toLocaleDateString()}</p>
                                  {new Date(n.expiry) < new Date() && <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">Expired</span>}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}

                  {/* ─── COMPLAINTS ──────────────────────────────── */}
                  {activeTab === "complaints" && (() => {
                    const filtered = search(complaints, ["title", "description", "status", "priority", "category"]);
                    return (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">Complaints ({filtered.length})</h3>
                          <GoldBtn onClick={() => setComplaintModal(true)}>
                            <FaPlus className="inline mr-2 text-xs sm:text-sm" /> File Complaint
                          </GoldBtn>
                        </div>
                        {filtered.length === 0 ? (
                          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                            <FaExclamationCircle className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-sm sm:text-base">No complaints found</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {paginate(filtered).map((c) => (
                              <motion.div key={c._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.002 }}>
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <span className={`px-2 py-1 text-xs rounded-full ${PriorityColors[c.priority] || "bg-gray-100 text-gray-800"}`}>{c.priority}</span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${StatusColors[c.status] || "bg-gray-100 text-gray-800"}`}>{c.status}</span>
                                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{c.category}</span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${c.nature === "PRIVATE" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>{c.nature}</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-[#0e2a4a] mb-1">{c.title}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2">{c.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                      <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                      <span className="flex items-center gap-1"><FaThumbsUp /> {c.weight || 0}</span>
                                      <span className="flex items-center gap-1"><FaCommentAlt /> {c.comments?.length || 0}</span>
                                    </div>
                                    {c.adminComment && <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg"><p className="text-xs text-blue-700 font-semibold">Admin: {c.adminComment}</p></div>}
                                    {c.assignedTo && <p className="text-xs text-green-600 mt-1">Assigned to: {c.assignedTo}</p>}
                                  </div>
                                  <div className="ml-0 sm:ml-4 flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                    <motion.button onClick={() => handleUpvote(c._id)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs sm:text-sm flex items-center justify-center gap-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <FaThumbsUp className="text-xs" /> Upvote
                                    </motion.button>
                                    <motion.button onClick={() => { setCommentModal(c); setCommentText(""); }} className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs sm:text-sm flex items-center justify-center gap-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <FaCommentAlt className="text-xs" /> Comment
                                    </motion.button>
                                    <motion.button onClick={() => setViewComplaintModal(c)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-sm flex items-center justify-center gap-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <FaEye className="text-xs" /> View
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}

                  {/* ─── SERVICES ────────────────────────────────── */}
                  {activeTab === "services" && (() => {
                    const filtered = search(services, ["serviceName", "serviceType", "description"]);
                    return (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-6">Available Services ({filtered.length})</h3>
                        {filtered.length === 0 ? (
                          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                            <FaTools className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-sm sm:text-base">No services available</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {paginate(filtered).map((s) => (
                              <motion.div key={s._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 flex flex-col"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                  <div>
                                    <h4 className="font-bold text-[#0e2a4a] text-base sm:text-lg">{s.serviceName}</h4>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{s.serviceType}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg sm:text-xl font-bold text-[#ffb703]">₹{s.price}</p>
                                    <p className="text-xs text-gray-500">{s.unit}</p>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 flex-1">{s.description}</p>
                                {s.vendor && (
                                  <p className="text-xs text-gray-500 mb-3">Vendor: <span className="font-semibold">{s.vendor.name}</span></p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} className={`text-sm ${star <= Math.round(s.reputation || 0) ? "text-[#ffb703]" : "text-gray-200"}`} />
                                  ))}
                                  <span className="text-xs text-gray-500">({s.peopleRated || 0})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <GoldBtn className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2" onClick={() => handleAddToBill(s._id)}>
                                    <FaPlus className="inline mr-1 text-xs" /> Add to Bill
                                  </GoldBtn>
                                  <motion.button onClick={() => { setRateModal(s); setRatingVal(0); }} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-xs sm:text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <FaStar className="text-xs" />
                                  </motion.button>
                                  <motion.button onClick={() => setServiceDetailModal(s)} className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 text-xs sm:text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <FaEye className="text-xs" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}

                  {/* ─── BILLABLES ───────────────────────────────── */}
                  {activeTab === "billables" && (() => {
                    const filtered = search(billables, ["serviceName"]);
                    const total = billables.reduce((sum, b) => sum + (b.price * (b.units || 1)), 0);
                    return (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">My Bills ({filtered.length})</h3>
                          {billables.length > 0 && (
                            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ffb703]/20 border border-[#ffb703]/40 text-[#0e2a4a] rounded-xl font-bold text-sm sm:text-base">
                              Total: ₹{total.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <DataTable
                          title={undefined}
                          columns={[
                            { header: "Service", accessor: "serviceName" },
                            { header: "Units", accessor: "unitsVal" },
                            { header: "Price", accessor: "priceVal" },
                            { header: "Total", accessor: "totalVal" },
                            { header: "Status", accessor: "statusBadge" },
                            { header: "Actions", accessor: "actions" },
                          ]}
                          data={paginate(filtered).map((b) => ({
                            ...b,
                            unitsVal: b.units || 1,
                            priceVal: `₹${b.price}`,
                            totalVal: `₹${(b.price * (b.units || 1)).toFixed(2)}`,
                            statusBadge: <span className={`px-2 py-1 text-xs rounded-full ${StatusColors[b.paymentStatus] || "bg-gray-100 text-gray-800"}`}>{b.paymentStatus || "unpaid"}</span>,
                            actions: (
                              <RedBtn onClick={() => handleDeleteFromBill(b._id)}>
                                <FaTrash className="text-xs" /> Remove
                              </RedBtn>
                            ),
                          }))}
                          emptyIcon="📋"
                          emptyText="No items in your bill"
                        />
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}

                  {/* ─── PAYMENTS ────────────────────────────────── */}
                  {activeTab === "payments" && (() => {
                    const filtered = search(paymentHistory, ["status"]);
                    return (
                      <>
                        <DataTable
                          title={`Payment History (${filtered.length})`}
                          columns={[
                            { header: "Order ID", accessor: "orderId" },
                            { header: "Amount", accessor: "amountVal" },
                            { header: "Status", accessor: "statusBadge" },
                            { header: "Date", accessor: "dateVal" },
                            { header: "Txn ID", accessor: "txnId" },
                          ]}
                          data={paginate(filtered).map((p) => ({
                            ...p,
                            orderId: p.razorpayOrderId ? p.razorpayOrderId.slice(-10) : "—",
                            amountVal: `₹${p.amount || 0}`,
                            statusBadge: <span className={`px-2 py-1 text-xs rounded-full ${StatusColors[p.status] || "bg-gray-100 text-gray-800"}`}>{p.status}</span>,
                            dateVal: formatDate(p.createdAt),
                            txnId: p.transactionId ? p.transactionId.slice(-12) : "—",
                          }))}
                          emptyIcon="💳"
                          emptyText="No payment history"
                        />
                        <PaginationControls total={filtered.length} />
                      </>
                    );
                  })()}

                  {/* ─── NOTIFICATIONS ───────────────────────────── */}
                  {activeTab === "notifications" && (() => {
                    const filtered = search(notifications, ["title", "message", "type"]);
                    return (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">Notifications ({filtered.length})</h3>
                            {unreadCount > 0 && <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{unreadCount} unread</span>}
                          </div>
                          <motion.button onClick={handleMarkAllRead} className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center gap-2 text-sm sm:text-base" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <FaCheck className="text-xs sm:text-sm" /> Mark All Read
                          </motion.button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {["ALL", "VISITOR", "MAINTENANCE", "ANNOUNCEMENT", "COMPLAINT", "BILL", "GENERAL"].map((t) => (
                            <motion.button key={t} onClick={() => setSearchTerm(t === "ALL" ? "" : t)}
                              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${(t === "ALL" && searchTerm === "") || searchTerm === t ? "bg-[#0e2a4a] text-white border-[#0e2a4a]" : "bg-white text-gray-600 border-gray-200 hover:border-[#ffb703]"}`}
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              {t}
                            </motion.button>
                          ))}
                        </div>

                        {filtered.length === 0 ? (
                          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                            <FaBell className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 text-sm sm:text-base">No notifications found</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {paginate(filtered).map((n) => (
                              <motion.div key={n._id}
                                className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-5 border transition-all duration-200 ${!n.isRead ? "border-l-4 border-l-teal-400 border-r border-t border-b border-white/20" : "border border-white/20 opacity-75"}`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.002 }}>
                                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                                    <div className="mt-1 shrink-0">
                                      {!n.isRead ? <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-teal-400 shadow-sm" /> : <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-200" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${NotifTypeBadgeColors[n.type] || "bg-gray-100 text-gray-800"}`}>{n.type}</span>
                                        {!n.isRead && <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700 font-semibold">New</span>}
                                        <span className="text-xs text-gray-400 ml-auto">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                      </div>
                                      <h4 className="font-bold text-[#0e2a4a] text-sm sm:text-base mb-1 truncate">{n.title}</h4>
                                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{n.message}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                                    <motion.button onClick={() => setNotifDetailModal(n)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1" whileHover={{ scale: 1.05 }}>
                                      <FaEye className="text-xs" /> View
                                    </motion.button>
                                    {!n.isRead && (
                                      <motion.button onClick={() => handleMarkOneRead(n._id)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-semibold flex items-center justify-center gap-1" whileHover={{ scale: 1.05 }}>
                                        <FaCheck className="text-xs" /> Read
                                      </motion.button>
                                    )}
                                    <RedBtn className="flex-1 sm:flex-none justify-center" onClick={() => handleDeleteNotification(n._id)}>
                                      <FaTrash className="text-xs" />
                                    </RedBtn>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <PaginationControls total={filtered.length} />
                      </div>
                    );
                  })()}
                  {/* ─── CHAT ────────────────────────────────────── */}
                  {activeTab === "chat" && (
                    <div style={{ height: "calc(100vh - 160px)" }}>
                      <ResidentChat />
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}

      {/* File Complaint */}
      <Modal open={complaintModal} onClose={() => setComplaintModal(false)} title="File a Complaint">
        <div className="space-y-4">
          <InputField label="Title" value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} placeholder="Brief description of the issue" />
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
            <textarea className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base" rows="4" value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} placeholder="Detailed description..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Nature" value={complaintForm.nature} onChange={(e) => setComplaintForm({ ...complaintForm, nature: e.target.value })} options={[{ value: "PUBLIC", label: "Public" }, { value: "PRIVATE", label: "Private" }]} />
            <SelectField label="Priority" value={complaintForm.priority} onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })} options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }]} />
          </div>
          <SelectField label="Category" value={complaintForm.category} onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })} options={[
            { value: "MAINTENANCE", label: "Maintenance" }, { value: "SECURITY", label: "Security" }, { value: "CLEANLINESS", label: "Cleanliness" }, { value: "NOISE", label: "Noise" }, { value: "PARKING", label: "Parking" }, { value: "OTHER", label: "Other" }
          ]} />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button onClick={() => setComplaintModal(false)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Cancel</button>
            <GoldBtn onClick={handleCreateComplaint}>Submit Complaint</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Generate QR Pass */}
      <Modal open={qrModal} onClose={() => { setQrModal(false); setGeneratedPass(null); setQrImageUrl(null); setQrForm({ fullName: "", phone: "", visitorFor: "", purpose: "", expectedDate: "" }); }} title="Generate Visitor QR Pass" wide>
        {!generatedPass ? (
          <div className="space-y-4">
            <div className="bg-teal-50 p-3 sm:p-4 rounded-xl border border-teal-200">
              <p className="text-xs sm:text-sm text-teal-800">This QR code will be pre-approved for your visitor. The guard scans it at entry.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Visitor Name" value={qrForm.fullName} onChange={(e) => setQrForm({ ...qrForm, fullName: e.target.value })} placeholder="Full name" />
              <InputField label="Phone" value={qrForm.phone} onChange={(e) => setQrForm({ ...qrForm, phone: e.target.value })} placeholder="10-digit" />
            </div>
            <InputField label="Visiting For" value={qrForm.visitorFor} onChange={(e) => setQrForm({ ...qrForm, visitorFor: e.target.value })} placeholder="e.g. Meeting, Delivery, Family Visit" />
            <InputField label="Purpose" value={qrForm.purpose} onChange={(e) => setQrForm({ ...qrForm, purpose: e.target.value })} placeholder="Short purpose description" />
            <InputField label="Expected Date (optional)" type="date" value={qrForm.expectedDate} onChange={(e) => setQrForm({ ...qrForm, expectedDate: e.target.value })} />
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button onClick={() => setQrModal(false)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Cancel</button>
              <GoldBtn onClick={handleGenerateQR}><FaQrcode className="inline mr-2" /> Generate QR</GoldBtn>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
              <FaCheckCircle className="text-2xl sm:text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-semibold text-sm sm:text-base">QR Pass Generated Successfully!</p>
            </div>
            {qrImageUrl && (
              <div className="flex flex-col items-center gap-4">
                <img src={qrImageUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl shadow-lg border-4 border-[#0e2a4a]/10" />
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-left w-full">
                  <p className="text-xs sm:text-sm"><strong>Visitor:</strong> {generatedPass.visitorName}</p>
                  <p className="text-xs sm:text-sm"><strong>Flat:</strong> {generatedPass.block}-{generatedPass.flatNo}</p>
                  <p className="text-xs sm:text-sm"><strong>Purpose:</strong> {generatedPass.purpose}</p>
                  <p className="text-xs sm:text-sm"><strong>Expires:</strong> {formatDate(generatedPass.qrExpiresAt)}</p>
                  <p className="text-xs text-gray-400 mt-2 break-all font-mono">Token: {generatedPass.qrToken}</p>
                </div>
                <a href={qrImageUrl} download={`visitor-pass-${generatedPass.qrToken.slice(-6)}.png`} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0e2a4a] text-white rounded-xl hover:bg-[#1a4b7a] transition-all text-sm sm:text-base">
                  <FaDownload /> Download QR Code
                </a>
              </div>
            )}
            <button onClick={() => { setGeneratedPass(null); setQrImageUrl(null); setQrForm({ fullName: "", phone: "", visitorFor: "", purpose: "", expectedDate: "" }); }} className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">
              Generate Another Pass
            </button>
          </div>
        )}
      </Modal>

      {/* Add Comment */}
      <Modal open={!!commentModal} onClose={() => setCommentModal(null)} title="Add Comment">
        {commentModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p className="font-semibold text-[#0e2a4a] text-sm sm:text-base">{commentModal.title}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{commentModal.description}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Your Comment</label>
              <textarea className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base" rows="4" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add your comment..." />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setCommentModal(null)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Cancel</button>
              <GoldBtn onClick={handleAddComment}><FaPaperPlane className="inline mr-2 text-xs sm:text-sm" /> Submit</GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* Rate Service */}
      <Modal open={!!rateModal} onClose={() => setRateModal(null)} title="Rate Service">
        {rateModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p className="font-bold text-[#0e2a4a] text-base sm:text-lg">{rateModal.serviceName}</p>
              <p className="text-xs sm:text-sm text-gray-500">{rateModal.vendor?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Your Rating</label>
              <StarRating value={ratingVal} onChange={setRatingVal} />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setRateModal(null)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Cancel</button>
              <GoldBtn onClick={handleRateService}><FaStar className="inline mr-2 text-xs sm:text-sm" /> Submit Rating</GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Profile */}
      <Modal open={profileEditModal} onClose={() => setProfileEditModal(false)} title="Edit Profile" wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
          <InputField label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
          <InputField label="Alternate Phone" value={profileForm.alternatePhone} onChange={(e) => setProfileForm({ ...profileForm, alternatePhone: e.target.value })} />
          <InputField label="Occupation" value={profileForm.occupation} onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })} />
          <InputField label="Family Members" type="number" value={profileForm.numberOfMembers} onChange={(e) => setProfileForm({ ...profileForm, numberOfMembers: e.target.value })} />
          <InputField label="Date of Birth" type="date" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} />
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Bio</label>
            <textarea className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base" rows="3" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Short bio..." />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button onClick={() => setProfileEditModal(false)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Cancel</button>
          <GoldBtn onClick={handleUpdateProfile}><FaCheck className="inline mr-2" /> Save Changes</GoldBtn>
        </div>
      </Modal>

      {/* View Complaint Detail */}
      <Modal open={!!viewComplaintModal} onClose={() => setViewComplaintModal(null)} title="Complaint Detail" wide>
        {viewComplaintModal && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${PriorityColors[viewComplaintModal.priority] || "bg-gray-100"}`}>{viewComplaintModal.priority}</span>
              <span className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${StatusColors[viewComplaintModal.status] || "bg-gray-100"}`}>{viewComplaintModal.status}</span>
              <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">{viewComplaintModal.category}</span>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <h4 className="font-bold text-[#0e2a4a] text-base sm:text-lg">{viewComplaintModal.title}</h4>
              <p className="text-gray-600 text-xs sm:text-sm mt-2 leading-relaxed">{viewComplaintModal.description}</p>
            </div>
            {viewComplaintModal.assignedTo && <div className="bg-green-50 p-2 sm:p-3 rounded-xl"><p className="text-xs sm:text-sm text-green-700">Assigned to: <strong>{viewComplaintModal.assignedTo}</strong></p></div>}
            {viewComplaintModal.adminComment && <div className="bg-blue-50 p-2 sm:p-3 rounded-xl"><p className="text-xs sm:text-sm text-blue-700">Admin comment: {viewComplaintModal.adminComment}</p></div>}
            {viewComplaintModal.comments?.length > 0 && (
              <div>
                <h5 className="font-semibold text-[#0e2a4a] mb-3 text-sm sm:text-base">Comments ({viewComplaintModal.comments.length})</h5>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {viewComplaintModal.comments.map((c, i) => (
                    <div key={i} className="bg-gray-50 p-2 sm:p-3 rounded-xl">
                      <div className="flex flex-wrap justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#0e2a4a]">{c.author}</span>
                        <span className="text-xs text-gray-400">{c.authorRole}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(viewComplaintModal.createdAt), { addSuffix: true })} · {viewComplaintModal.weight || 0} upvotes</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <GoldBtn onClick={() => { setCommentModal(viewComplaintModal); setViewComplaintModal(null); setCommentText(""); }}>
                <FaCommentAlt className="inline mr-2 text-xs sm:text-sm" /> Add Comment
              </GoldBtn>
              <button onClick={() => setViewComplaintModal(null)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification Detail */}
      <Modal open={!!notifDetailModal} onClose={() => setNotifDetailModal(null)} title="Notification Detail">
        {notifDetailModal && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${NotifTypeBadgeColors[notifDetailModal.type] || "bg-gray-100"}`}>{notifDetailModal.type}</span>
              <span className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${notifDetailModal.isRead ? "bg-green-100 text-green-700" : "bg-teal-100 text-teal-700"}`}>{notifDetailModal.isRead ? "✓ Read" : "Unread"}</span>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p className="font-bold text-[#0e2a4a] text-base sm:text-lg">{notifDetailModal.title}</p>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{notifDetailModal.message}</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{format(new Date(notifDetailModal.createdAt), "dd MMM yyyy, hh:mm a")}</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              {!notifDetailModal.isRead && (
                <GoldBtn onClick={() => { handleMarkOneRead(notifDetailModal._id); setNotifDetailModal(null); }}>
                  <FaCheck className="inline mr-2 text-xs sm:text-sm" /> Mark as Read
                </GoldBtn>
              )}
              <button onClick={() => setNotifDetailModal(null)} className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base">Close</button>
            </div>
          </div>
        )}
      </Modal>

      

      {/* Service Detail */}
      <Modal open={!!serviceDetailModal} onClose={() => setServiceDetailModal(null)} title="Service Details">
        {serviceDetailModal && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0e2a4a]">{serviceDetailModal.serviceName}</h3>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{serviceDetailModal.serviceType}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#ffb703]">₹{serviceDetailModal.price}</p>
                <p className="text-xs text-gray-500">{serviceDetailModal.unit}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{serviceDetailModal.description}</p>
            {serviceDetailModal.vendor && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-[#0e2a4a] mb-2">Vendor Details</h4>
                <p className="text-sm"><strong>Name:</strong> {serviceDetailModal.vendor.name}</p>
                {serviceDetailModal.vendor.phone && <p className="text-sm"><strong>Phone:</strong> {serviceDetailModal.vendor.phone}</p>}
                {serviceDetailModal.vendor.email && <p className="text-sm"><strong>Email:</strong> {serviceDetailModal.vendor.email}</p>}
              </div>
            )}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => <FaStar key={s} className={`text-lg ${s <= Math.round(serviceDetailModal.reputation || 0) ? "text-[#ffb703]" : "text-gray-200"}`} />)}
              <span className="text-sm text-gray-500">({serviceDetailModal.peopleRated || 0} ratings)</span>
            </div>
            <p className="text-sm text-gray-500">Available slots: {serviceDetailModal.turns || "—"}</p>
            <div className="flex gap-3">
              <GoldBtn className="flex-1" onClick={() => { handleAddToBill(serviceDetailModal._id); setServiceDetailModal(null); }}>
                <FaPlus className="inline mr-2" /> Add to Bill
              </GoldBtn>
              <motion.button onClick={() => { setRateModal(serviceDetailModal); setServiceDetailModal(null); setRatingVal(0); }} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200" whileHover={{ scale: 1.05 }}>
                Rate
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResidentDashboard;