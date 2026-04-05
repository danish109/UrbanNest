import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow, format } from "date-fns";
import logo from "../../assets/logo5.png";
import {
  FaUsers,
  FaHome,
  FaBell,
  FaTools,
  FaChartLine,
  FaSignOutAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaExclamationCircle,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaUserTie,
  FaStore,
  FaFilter,
  FaUserCircle,
  FaBell as FaBellIcon,
  FaPaperPlane,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdApartment } from "react-icons/md";
import { Link } from "react-router-dom";

const BASE = "http://localhost:8000";

// ─── Color Maps ─────────────────────────────────────────────────────────────
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
  UNPAID: "bg-red-100 text-red-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-orange-100 text-orange-800",
  WAIVED: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-red-100 text-red-800",
  "ON LEAVE": "bg-yellow-100 text-yellow-800",
  OCCUPIED: "bg-blue-100 text-blue-800",
  VACCANT: "bg-gray-100 text-gray-800",
};

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Reusable Components ─────────────────────────────────────────────────────
const DashboardCard = ({ title, value, icon, color, delay = 0 }) => (
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

const DataTable = ({ title, columns, data, emptyIcon, emptyText }) => (
  <motion.div
    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {title && (
      <motion.div
        className="p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-[#0e2a4a] to-[#1a4b7a]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-bold text-lg sm:text-xl text-white">{title}</h3>
      </motion.div>
    )}
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-gray-400">
          <div className="text-4xl sm:text-5xl mb-3">{emptyIcon || "📭"}</div>
          <p className="text-sm sm:text-base">{emptyText || "No data found"}</p>
        </div>
      ) : (
        <table className="min-w-full">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              {columns.map((col, i) => (
                <motion.th
                  key={i}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {col.header}
                </motion.th>
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
                whileHover={{ scale: 1.002 }}
              >
                {columns.map((col, ci) => (
                  <td key={ci} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                    {React.isValidElement(row[col.accessor])
                      ? row[col.accessor]
                      : row[col.accessor]}
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

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => (
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
          className="bg-white/95 backdrop-blur-xl p-4 sm:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0e2a4a]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
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
    {label && (
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        {label}
      </label>
    )}
    <input
      className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all text-sm sm:text-base"
      {...props}
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        {label}
      </label>
    )}
    <select
      className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all text-sm sm:text-base"
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
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
    className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 text-xs sm:text-sm transition-all duration-300 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Data states
  const [dashStats, setDashStats] = useState(null);
  const [residents, setResidents] = useState([]);
  const [guards, setGuards] = useState([]);
  const [houses, setHouses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [services, setServices] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDetailModal, setNotifDetailModal] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    emnum: "",
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Reduced for mobile

  // Modal states
  const [guardModal, setGuardModal] = useState(false);
  const [guardEditModal, setGuardEditModal] = useState(null);
  const [houseModal, setHouseModal] = useState(false);
  const [allotModal, setAllotModal] = useState(false);
  const [noticeModal, setNoticeModal] = useState(false);
  const [vendorModal, setVendorModal] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [billModal, setBillModal] = useState(false);
  const [singleBillModal, setSingleBillModal] = useState(false);
  const [complaintUpdateModal, setComplaintUpdateModal] = useState(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState(null);

  // Form states
  const [guardForm, setGuardForm] = useState({
    fullName: "",
    phone: "",
    shift: "DAY",
    status: "ACTIVE",
  });
  const [houseForm, setHouseForm] = useState({ flatNo: "", block: "" });
  const [allotForm, setAllotForm] = useState({
    flatNo: "",
    block: "",
    ownerStatus: "SOLD",
    fullName: "",
    registry: "",
    phone: "",
    email: "",
    nominee: "",
    tenure: "",
  });
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    expiry: "",
  });
  const [vendorForm, setVendorForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    documents: "",
    adder: "",
  });
  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    serviceType: "",
    description: "",
    price: "",
    unit: "",
    turns: "",
    vendorId: "",
    contact: "",
    available: "true",
  });
  const [billForm, setBillForm] = useState({
    amount: "",
    dueDate: "",
    month: "",
  });
  const [singleBillForm, setSingleBillForm] = useState({
    flatNo: "",
    block: "",
    amount: "",
    dueDate: "",
    month: "",
  });
  const [complaintUpdateForm, setComplaintUpdateForm] = useState({
    status: "",
    assignedTo: "",
    priority: "",
    adminComment: "",
  });
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "ANNOUNCEMENT",
  });
  const [markPaidForm, setMarkPaidForm] = useState({
    paymentMode: "CASH",
    transactionId: "",
    notes: "",
  });
  const [billFilter, setBillFilter] = useState({
    status: "",
    block: "",
    month: "",
  });

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  useEffect(() => {
    fetchUnreadCount();
  }, []);
  useEffect(() => {
  fetchAdminProfile();
  fetchNotifications();
}, []);

  // ─── API Calls ───────────────────────────────────────────────────────────────
  const api = useCallback(async (method, url, data = null) => {
    const config = { withCredentials: true };
    if (method === "get") return axios.get(`${BASE}${url}`, config);
    if (method === "post") return axios.post(`${BASE}${url}`, data, config);
    if (method === "put") return axios.put(`${BASE}${url}`, data, config);
    if (method === "patch") return axios.patch(`${BASE}${url}`, data, config);
    if (method === "delete") return axios.delete(`${BASE}${url}`, config);
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const r = await api("get", "/user/profile");
      if (r.data.success) {
        setAdminProfile(r.data.profile);
        setProfileForm({
          fullName: r.data.profile.fullName || "",
          phone: r.data.profile.phone || "",
          emnum: r.data.profile.emnum || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const r = await api("patch", "/user/profile/update", profileForm);
      if (r.data.success) {
        toast.success("Profile updated");
        fetchAdminProfile();
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const r = await axios.patch(`${BASE}/user/profile/photo`, formData, {
        withCredentials: true,
      });

      if (r.data.success) {
        toast.success("Photo updated");
        fetchAdminProfile();
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const fetchDashboard = async () => {
    const r = await api("get", "/analytics/dashboard");
    if (r.data.success) setDashStats(r.data.stats);
  };

  const fetchResidents = async () => {
    try {
      const r = await api("get", "/resident/all");

      console.log("FULL RESPONSE:", r); // 👈 VERY IMPORTANT

      if (r?.success) {
        setResidents(r.residents || r.data || []);
      } else {
        setResidents([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResidents([]);
    }
  };
  const fetchGuards = async () => {
    const token = localStorage.getItem("token");

    const r = await api("get", "/superadmin/guards", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (r.data.success) setGuards(r.data.guards || r.data.data || []);
  };

  const fetchHouses = async () => {
    const r = await api("get", "/superadmin/houses/all");
    if (r.data.success) setHouses(r.data.houses || r.data.data || []);
  };

  const fetchComplaints = async () => {
    const r = await api("get", "/superadmin/complaints/get");
    if (r.data.result) setComplaints(r.data.result);
  };

  const fetchNotices = async () => {
    const r = await api("get", "/superadmin/notices/show");
    if (r.data.result) setNotices(r.data.result);
  };

  const fetchVendors = async () => {
    const r = await api("get", "/superadmin/vendors/get");
    if (r.data.success) setVendors(r.data.vendors || []);
  };

  const fetchServices = async () => {
    const r = await api("get", "/superadmin/services/get");
    if (r.data.success) setServices(r.data.services || []);
  };

  const fetchBills = async () => {
    const params = new URLSearchParams();
    if (billFilter.status) params.append("status", billFilter.status);
    if (billFilter.block) params.append("block", billFilter.block);
    if (billFilter.month) params.append("month", billFilter.month);
    const r = await api(
      "get",
      `/superadmin/maintenance/all?${params.toString()}`,
    );
    if (r.data.success) setBills(r.data.bills || []);
  };
  const fetchNotifications = async () => {
    const r = await api("get", "/superadmin/notifications?limit=50");
    if (r.data.success) setNotifications(r.data.notifications || []);
  };

  const fetchUnreadCount = async () => {
    try {
      const r = await api("get", "/superadmin/notifications/unread-count");
      if (r.data.success) setUnreadCount(r.data.unreadCount || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      const r = await api("patch", "/superadmin/notifications/read-all");
      if (r.data.success) {
        toast.success(r.data.message || "All marked as read");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOneRead = async (notifId) => {
    try {
      await api("patch", `/superadmin/notifications/read/${notifId}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch {}
  };

  const handleDeleteNotification = async (notifId) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      const r = await api(
        "delete",
        `/superadmin/notifications/delete/${notifId}`,
      );
      if (r.data.success) {
        toast.success("Notification deleted");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  // Tab-based data loading
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        switch (activeTab) {
          case "profile":
            await fetchAdminProfile();
            break;
          case "dashboard":
            await fetchDashboard();
            break;
          case "residents":
            await fetchResidents();
            break;
          case "guards":
            await fetchGuards();
            break;
          case "houses":
            await fetchHouses();
            break;
          case "complaints":
            await fetchComplaints();
            break;
          case "notices":
            await fetchNotices();
            break;
          case "vendors":
            await fetchVendors();
            break;
          case "services":
            await fetchServices();
            break;
          case "maintenance":
            await fetchBills();
            break;
          case "notifications":
            await fetchNotifications();
            await fetchUnreadCount();
            break;
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
    if (activeTab === "maintenance") fetchBills();
  }, [billFilter]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await api("post", "/user/admin/logout");
      localStorage.removeItem("admin");
      toast.success("Logged out successfully");
      navigate("/login/admin");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Guards
  const handleAddGuard = async () => {
    try {
      const r = await api("post", "/superadmin/guards/add", guardForm);
      if (r.data.success) {
        toast.success(`Guard added! Key: ${r.data.guard?.pass}`);
        setGuardModal(false);
        setGuardForm({
          fullName: "",
          phone: "",
          shift: "DAY",
          status: "ACTIVE",
        });
        fetchGuards();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add guard");
    }
  };

  const handleUpdateGuard = async () => {
    try {
      const r = await api(
        "patch",
        `/superadmin/guards/update/${guardEditModal._id}`,
        guardEditModal,
      );
      if (r.data.success) {
        toast.success("Guard updated");
        setGuardEditModal(null);
        fetchGuards();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteGuard = async (id) => {
    if (!window.confirm("Delete this guard?")) return;
    try {
      const r = await api("delete", `/superadmin/guards/delete/${id}`);
      if (r.data.success) {
        toast.success("Guard deleted");
        fetchGuards();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  // Houses
  const handleAddHouse = async () => {
    try {
      const r = await api("post", "/superadmin/houses/add", houseForm);
      if (r.data.success) {
        toast.success("House added");
        setHouseModal(false);
        setHouseForm({ flatNo: "", block: "", passkey: "", email: "" });
        fetchHouses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleAllotHouse = async () => {
    try {
      const r = await api("post", "/superadmin/houses/allot", allotForm);
      if (r.data.success) {
        toast.success("House allotted successfully");
        setAllotModal(false);
        setAllotForm({
          flatNo: "",
          block: "",
          ownerStatus: "SOLD",
          fullName: "",
          registry: "",
          phone: "",
          email: "",
          nominee: "",
          tenure: "",
        });
        fetchHouses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleVacateHouse = async (flatNo, block) => {
    if (!window.confirm(`Vacate flat ${flatNo}-${block}?`)) return;
    try {
      const r = await api("post", "/superadmin/houses/delete", {
        flatNo,
        block,
      });
      if (r.data.success) {
        toast.success("House vacated");
        fetchHouses();
      }
    } catch {
      toast.error("Failed");
    }
  };

  // Notices
  const handleCreateNotice = async () => {
    try {
      const r = await api("post", "/superadmin/notices/create", noticeForm);
      if (r.data.success) {
        toast.success("Notice created & residents notified");
        setNoticeModal(false);
        setNoticeForm({
          title: "",
          content: "",
          category: "GENERAL",
          expiry: "",
        });
        fetchNotices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const r = await api("delete", `/superadmin/notices/delete/${id}`);
      if (r.data.message) {
        toast.success("Notice deleted");
        fetchNotices();
      }
    } catch {
      toast.error("Failed");
    }
  };

  // Complaints
  const handleUpdateComplaint = async () => {
    try {
      const r = await api(
        "patch",
        `/superadmin/complaints/update/${complaintUpdateModal._id}`,
        complaintUpdateForm,
      );
      if (r.data.success) {
        toast.success("Complaint updated & resident notified");
        setComplaintUpdateModal(null);
        setComplaintUpdateForm({
          status: "",
          assignedTo: "",
          priority: "",
          adminComment: "",
        });
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  // Vendors
  const handleAddVendor = async () => {
    try {
      const r = await api("post", "/superadmin/vendors/add", vendorForm);
      if (r.data.success) {
        toast.success("Vendor added");
        setVendorModal(false);
        setVendorForm({
          name: "",
          phone: "",
          email: "",
          address: "",
          documents: "",
          adder: "",
        });
        fetchVendors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm("Delete vendor?")) return;
    try {
      const r = await api("delete", `/superadmin/vendors/delete/${id}`);
      if (r.data.success) {
        toast.success("Vendor deleted");
        fetchVendors();
      }
    } catch {
      toast.error("Failed");
    }
  };

  // Services
  const handleAddService = async () => {
    try {
      const r = await api("post", "/superadmin/services/add", serviceForm);
      if (r.data.success) {
        toast.success("Service created");
        setServiceModal(false);
        setServiceForm({
          serviceName: "",
          serviceType: "",
          description: "",
          price: "",
          unit: "",
          turns: "",
          vendorId: "",
          contact: "",
          available: "true",
        });
        fetchServices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete service?")) return;
    try {
      const r = await api("delete", `/superadmin/services/delete/${id}`);
      if (r.data.success) {
        toast.success("Service deleted");
        fetchServices();
      }
    } catch {
      toast.error("Failed");
    }
  };

  // Maintenance
  const handleGenerateBills = async () => {
    try {
      const r = await api("post", "/superadmin/maintenance/generate", billForm);
      if (r.data.success) {
        toast.success(
          `${r.data.results?.created} bills generated, ${r.data.results?.skipped} skipped`,
        );
        setBillModal(false);
        setBillForm({ amount: "", dueDate: "", month: "" });
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleGenerateSingleBill = async () => {
    try {
      const r = await api(
        "post",
        "/superadmin/maintenance/generate-single",
        singleBillForm,
      );
      if (r.data.success) {
        toast.success("Bill created");
        setSingleBillModal(false);
        setSingleBillForm({
          flatNo: "",
          block: "",
          amount: "",
          dueDate: "",
          month: "",
        });
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleMarkPaid = async () => {
    try {
      const r = await api(
        "patch",
        `/superadmin/maintenance/mark-paid/${markPaidModal._id}`,
        markPaidForm,
      );
      if (r.data.success) {
        toast.success("Bill marked as paid & resident notified");
        setMarkPaidModal(null);
        setMarkPaidForm({ paymentMode: "CASH", transactionId: "", notes: "" });
        fetchBills();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleSendReminder = async (billId) => {
    try {
      const r = await api("post", `/superadmin/maintenance/remind/${billId}`);
      if (r.data.success) toast.success("Reminder sent!");
    } catch {
      toast.error("Failed to send reminder");
    }
  };

  const handleMarkOverdue = async () => {
    try {
      const r = await api("patch", "/superadmin/maintenance/mark-overdue");
      if (r.data.success) {
        toast.success(r.data.message);
        fetchBills();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      const r = await api("delete", `/superadmin/maintenance/delete/${id}`);
      if (r.data.success) {
        toast.success("Bill deleted");
        fetchBills();
      }
    } catch {
      toast.error("Failed");
    }
  };

  // Broadcast
  const handleBroadcast = async () => {
    try {
      const r = await api("post", "/superadmin/broadcast", broadcastForm);
      if (r.data.success || r.status === 200) {
        toast.success("Broadcast sent to all residents");
        setBroadcastModal(false);
        setBroadcastForm({ title: "", message: "", type: "ANNOUNCEMENT" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d) ? "N/A" : format(d, "dd MMM yyyy");
  };

  // ─── Filtering & Pagination ──────────────────────────────────────────────────
  const search = (arr, keys) =>
    arr.filter((item) =>
      keys.some((k) =>
        String(item[k] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    );

  const paginate = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const PaginationControls = ({ total }) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
          whileHover={currentPage !== 1 ? { scale: 1.02 } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.98 } : {}}
        >
          <FaChevronLeft className="text-xs sm:text-sm" /> Previous
        </motion.button>
        <div className="flex flex-wrap justify-center items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
            (p) => (
              <motion.button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${currentPage === p ? "bg-[#0e2a4a] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md"}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {p}
              </motion.button>
            ),
          )}
        </div>
        <motion.button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
          whileHover={currentPage !== totalPages ? { scale: 1.02 } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.98 } : {}}
        >
          Next <FaChevronRight className="text-xs sm:text-sm" />
        </motion.button>
      </motion.div>
    );
  };

  // Sidebar items
  const sidebarItems = [
    { key: "profile", icon: FaUserCircle, label: "Profile" },
    { key: "dashboard", icon: FaChartLine, label: "Dashboard" },
    { key: "residents", icon: FaUsers, label: "Residents" },
    { key: "guards", icon: FaShieldAlt, label: "Guards" },
    { key: "houses", icon: FaBuilding, label: "Houses" },
    { key: "complaints", icon: FaExclamationCircle, label: "Complaints" },
    { key: "notices", icon: FaBell, label: "Notices" },
    { key: "vendors", icon: FaStore, label: "Vendors" },
    { key: "services", icon: FaTools, label: "Services" },
    { key: "maintenance", icon: FaMoneyBillWave, label: "Maintenance" },
    { key: "notifications", icon: FaBellIcon, label: "Notifications" }
  ];

  const adminUser = JSON.parse(localStorage.getItem("admin") || "{}");

  // ─── Render ──────────────────────────────────────────────────────────────────
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
          
          <motion.div
            className="flex items-center gap-2 sm:gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden shadow-md hover:scale-110 transition">
        <img
          src={logo}
          alt="UrbanNest"
          className="w-full h-full object-cover"
        />
      </div>

              <motion.span
                className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wide"
                whileHover={{ scale: 1.05 }}
              >
                UrbanNest
              </motion.span>
              <span className="hidden md:block px-2 sm:px-3 py-1 bg-[#ffb703]/20 text-[#ffb703] rounded-full text-xs font-bold uppercase tracking-widest border border-[#ffb703]/30">
                Admin
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-full hover:bg-[#ffb703]/20 transition"
              >
                <FaBellIcon className="text-lg sm:text-xl text-white" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* 🔽 Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-black rounded-xl shadow-xl p-4 z-50">
                  <h4 className="font-bold mb-2">Notifications</h4>

                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        className="border-b py-2 text-sm cursor-pointer hover:bg-gray-50"
                      >
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-gray-500 text-xs">{n.message}</p>
                      </div>
                    ))
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("notifications");
                      setNotifOpen(false);
                    }}
                    className="mt-2 text-blue-500 text-sm"
                  >
                    View All →
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={
                    adminProfile?.profilePhoto?.url ||
                    "https://via.placeholder.com/40"
                  }
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#ffb703] object-cover"
                />
              </button>

              {/* 🔽 Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-xl shadow-xl p-4 z-50">
                  <div className="mb-3">
                    <p className="font-semibold">
                      {adminProfile?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {adminProfile?.email}
                    </p>
                  </div>

                  <hr />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab("profile");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm hover:text-[#ffb703]"
                  >
                    View Profile
                  </button>
                </div>
              )}
            </div>
            {["Gate Monitoring"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link
                  to=
                     "/services"
                      
                      
                  
                  className="hover:text-[#ffb703] transition-all duration-300 relative group text-sm lg:text-base"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ffb703] transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
            <motion.button
              onClick={() => setBroadcastModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#ffb703]/20 hover:bg-[#ffb703]/30 border border-[#ffb703]/40 text-[#ffb703] rounded-xl transition-all duration-300 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane className="text-xs sm:text-sm" /> Broadcast
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt className="mr-2 text-sm sm:text-base" /> Logout
            </motion.button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden bg-[#0e2a4a] px-4 pb-4 space-y-3 border-t border-[#1a4b7a]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 font-medium ${activeTab === item.key ? "bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a]" : "text-white hover:bg-white/10"}`}
                >
                  <item.icon className="mr-3 text-base" />
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                onClick={handleLogout}
                className="flex items-center w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <motion.div
          className="hidden lg:block w-64 h-full overflow-y-auto bg-white/80 backdrop-blur-xl text-[#0e2a4a] shadow-2xl border-r border-white/20 relative z-10"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="p-6 border-b border-gray-200/50">
            <motion.h1
              className="text-xl font-bold flex items-center text-[#0e2a4a]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FaUserTie className="mr-3 text-[#ffb703]" /> Admin Portal
            </motion.h1>
            <motion.p
              className="text-sm text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {adminProfile?.fullName?.split(" ")[0] || "Admin"} —{" "}
              {adminProfile?.adminlevel || "Admin"}
            </motion.p>
          </div>

          <nav className="p-4">
            <motion.ul
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {sidebarItems.map((item) => (
                <motion.li key={item.key} variants={itemVariants}>
                  <motion.button
                    onClick={() => {
                      setActiveTab(item.key);
                      setMobileOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 font-medium ${activeTab === item.key ? "bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] shadow-lg" : "hover:bg-white/50 hover:shadow-md text-gray-700"}`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="mr-3 text-lg" />
                    {item.label}
                    {item.key === "notifications" && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
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
          <motion.header
            className="bg-white/80 backdrop-blur-xl shadow-sm p-4 sm:p-6 border-b border-gray-200/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h2
                className="text-xl sm:text-2xl font-bold capitalize text-[#0e2a4a]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {sidebarItems.find((s) => s.key === activeTab)?.label ||
                  "Dashboard"}
              </motion.h2>
              {activeTab !== "dashboard" && (
                <motion.div
                  className="relative w-full sm:w-80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] focus:border-transparent transition-all duration-300 shadow-sm text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                </motion.div>
              )}
            </div>
          </motion.header>

          {/* Main content */}
          <main className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="flex justify-center items-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ffb703]/30 border-t-[#ffb703] rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium text-sm sm:text-base">Loading...</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* ─── DASHBOARD ─────────────────────────────────────── */}
                  {activeTab === "dashboard" && (
                    <>
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <DashboardCard
                          title="Total Residents"
                          value={dashStats?.residents?.total ?? "—"}
                          icon={<FaUsers className="text-xl sm:text-2xl" />}
                          color="from-blue-500 to-blue-600"
                          delay={0}
                        />
                        <DashboardCard
                          title="Active Residents"
                          value={dashStats?.residents?.active ?? "—"}
                          icon={<FaCheckCircle className="text-xl sm:text-2xl" />}
                          color="from-green-500 to-green-600"
                          delay={0.1}
                        />
                        <DashboardCard
                          title="Visitors Today"
                          value={dashStats?.visitors?.today ?? "—"}
                          icon={<FaUserCircle className="text-xl sm:text-2xl" />}
                          color="from-yellow-500 to-yellow-600"
                          delay={0.2}
                        />
                        <DashboardCard
                          title="Open Complaints"
                          value={dashStats?.complaints?.open ?? "—"}
                          icon={<FaExclamationCircle className="text-xl sm:text-2xl" />}
                          color="from-red-500 to-red-600"
                          delay={0.3}
                        />
                        <DashboardCard
                          title="Active Notices"
                          value={dashStats?.notices?.active ?? "—"}
                          icon={<FaBell className="text-xl sm:text-2xl" />}
                          color="from-purple-500 to-purple-600"
                          delay={0.4}
                        />
                      </motion.div>

                      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        {/* Visitor Stats */}
                        <motion.div
                          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-4">
                            Visitor Overview
                          </h3>
                          <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {[
                              {
                                label: "This Month",
                                value: dashStats?.visitors?.thisMonth ?? 0,
                                color: "bg-blue-50 text-blue-700",
                              },
                              {
                                label: "Inside Now",
                                value:
                                  dashStats?.visitors?.currentlyInside ?? 0,
                                color: "bg-green-50 text-green-700",
                              },
                              {
                                label: "Pending",
                                value:
                                  dashStats?.visitors?.pendingApprovals ?? 0,
                                color: "bg-orange-50 text-orange-700",
                              },
                            ].map((s) => (
                              <div
                                key={s.label}
                                className={`p-2 sm:p-4 rounded-xl ${s.color} text-center`}
                              >
                                <div className="text-xl sm:text-3xl font-bold">
                                  {s.value}
                                </div>
                                <div className="text-xs font-semibold mt-1 opacity-80">
                                  {s.label}
                                </div>
                              </div>
                            ))}
                          </div>
                          {dashStats?.visitors?.trend?.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">
                                Last 7 Days
                              </p>
                              <div className="flex items-end gap-1 h-16">
                                {dashStats.visitors.trend.map((t) => {
                                  const maxVal = Math.max(
                                    ...dashStats.visitors.trend.map(
                                      (d) => d.count,
                                    ),
                                    1,
                                  );
                                  return (
                                    <motion.div
                                      key={t.date}
                                      className="flex-1 bg-[#ffb703] rounded-t"
                                      style={{
                                        height: `${(t.count / maxVal) * 100}%`,
                                        minHeight: "4px",
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      title={`${t.date}: ${t.count}`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>

                        {/* Complaint Stats */}
                        <motion.div
                          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-4">
                            Complaint Overview
                          </h3>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                            {[
                              {
                                label: "Total",
                                value: dashStats?.complaints?.total ?? 0,
                                color: "bg-gray-50 text-gray-700",
                              },
                              {
                                label: "Open",
                                value: dashStats?.complaints?.open ?? 0,
                                color: "bg-red-50 text-red-700",
                              },
                              {
                                label: "In Progress",
                                value: dashStats?.complaints?.inProgress ?? 0,
                                color: "bg-yellow-50 text-yellow-700",
                              },
                              {
                                label: "Resolved",
                                value: dashStats?.complaints?.resolved ?? 0,
                                color: "bg-green-50 text-green-700",
                              },
                            ].map((s) => (
                              <div
                                key={s.label}
                                className={`p-2 sm:p-3 rounded-xl ${s.color} flex items-center justify-between`}
                              >
                                <span className="text-xs sm:text-sm font-semibold">
                                  {s.label}
                                </span>
                                <span className="text-lg sm:text-xl font-bold">
                                  {s.value}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${dashStats?.complaints?.resolutionRate ?? 0}%`,
                              }}
                              transition={{ duration: 1, delay: 0.8 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            Resolution Rate:{" "}
                            {dashStats?.complaints?.resolutionRate ?? 0}%
                          </p>
                        </motion.div>
                      </div>
                    </>
                  )}

                  {activeTab === "profile" && adminProfile && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border">
                        {/* PROFILE HEADER */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                          <div className="relative">
                            <img
                              src={
                                adminProfile.profilePhoto?.url ||
                                "https://via.placeholder.com/100"
                              }
                              alt="profile"
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#ffb703]"
                            />
                            <input
                              type="file"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          <div className="text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#0e2a4a]">
                              {adminProfile.fullName}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500">
                              {adminProfile.email}
                            </p>
                          </div>
                        </div>

                        {/* FORM */}
                        <div className="grid gap-4">
                          <InputField
                            label="Full Name"
                            value={profileForm.fullName}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                fullName: e.target.value,
                              })
                            }
                          />

                          <InputField
                            label="Phone"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                phone: e.target.value,
                              })
                            }
                          />

                          <InputField
                            label="Employee Id"
                            value={profileForm.emnum}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                emnum: e.target.value,
                              })
                            }
                          />

                          <GoldBtn onClick={handleUpdateProfile}>
                            <FaCheck className="inline mr-2" />
                            Update Profile
                          </GoldBtn>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── RESIDENTS ─────────────────────────────────────── */}
                  {activeTab === "residents" &&
                    (() => {
                      const filtered = search(residents, [
                        "fullName",
                        "email",
                        "phone",
                        "flatNo",
                        "block",
                      ]);
                      return (
                        <>
                          <DataTable
                            title={`Residents (${filtered.length})`}
                            columns={[
                              { header: "Name", accessor: "fullName" },
                              { header: "Email", accessor: "email" },
                              { header: "Phone", accessor: "phone" },
                              { header: "Flat", accessor: "flat" },
                              { header: "Status", accessor: "statusBadge" },
                            ]}
                            data={paginate(filtered).map((r) => ({
                              ...r,
                              flat: `${r.block}-${r.flatNo}`,
                              statusBadge: (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${r.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {r.isActive ? "Active" : "Inactive"}
                                </span>
                              ),
                            }))}
                            emptyIcon="👥"
                            emptyText="No residents found"
                          />
                          <PaginationControls total={filtered.length} />
                        </>
                      );
                    })()}

                  {/* ─── GUARDS ────────────────────────────────────────── */}
                  {activeTab === "guards" &&
                    (() => {
                      const filtered = search(guards, [
                        "fullName",
                        "phone",
                        "shift",
                        "status",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Security Guards ({filtered.length})
                            </h3>
                            <GoldBtn onClick={() => setGuardModal(true)}>
                              <FaPlus className="inline mr-2 text-xs sm:text-sm" />
                              Add Guard
                            </GoldBtn>
                          </motion.div>
                          <DataTable
                            columns={[
                              { header: "Name", accessor: "fullName" },
                              { header: "Phone", accessor: "phone" },
                              { header: "Shift", accessor: "shiftBadge" },
                              { header: "Status", accessor: "statusBadge" },
                              { header: "Actions", accessor: "actions" },
                            ]}
                            data={paginate(filtered).map((g) => ({
                              ...g,
                              shiftBadge: (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  {g.shift}
                                </span>
                              ),
                              statusBadge: (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${StatusColors[g.status] || "bg-gray-100 text-gray-800"}`}
                                >
                                  {g.status}
                                </span>
                              ),
                              actions: (
                                <div className="flex gap-2">
                                  <motion.button
                                    onClick={() => {
                                      setGuardEditModal({ ...g });
                                    }}
                                    className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs sm:text-sm flex items-center gap-1 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaEdit className="text-xs" /> Edit
                                  </motion.button>
                                  <RedBtn
                                    onClick={() => handleDeleteGuard(g._id)}
                                  >
                                    <FaTrash className="text-xs" /> Delete
                                  </RedBtn>
                                </div>
                              ),
                            }))}
                            emptyIcon="🛡️"
                            emptyText="No guards found"
                          />
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── HOUSES ────────────────────────────────────────── */}
                  {activeTab === "houses" &&
                    (() => {
                      const filtered = search(houses, [
                        "flatNo",
                        "block",
                        "fullName",
                        "email",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Houses ({filtered.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <GoldBtn onClick={() => setHouseModal(true)}>
                                <FaPlus className="inline mr-2 text-xs sm:text-sm" />
                                Add House
                              </GoldBtn>
                              <motion.button
                                onClick={() => setAllotModal(true)}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaKey className="inline mr-2 text-xs sm:text-sm" />
                                Allot House
                              </motion.button>
                            </div>
                          </motion.div>
                          <DataTable
                            columns={[
                              { header: "Flat", accessor: "flat" },
                              { header: "Block", accessor: "block" },
                              { header: "Email", accessor: "email" },
                              { header: "Owner", accessor: "owner" },
                              { header: "Phone", accessor: "phone" },
                              { header: "Passkey", accessor: "passkeyDisplay" }, // ← new column
                              { header: "Actions", accessor: "actions" },
                            ]}
                            data={paginate(filtered).map((h) => ({
                              ...h,
                              flat: h.flatNo,
                              owner:
                                h.ownerStatus === "VACCANT" ? (
                                  <span className="text-gray-400 italic">
                                    Vacant
                                  </span>
                                ) : (
                                  h.fullName
                                ),
                              statusBadge: (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${StatusColors[h.ownerStatus] || "bg-gray-100 text-gray-800"}`}
                                >
                                  {h.ownerStatus}
                                </span>
                              ),
                              // ── passkey cell ──────────────────────────────────────────────────
                              passkeyDisplay: h.passkey ? (
                                <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg font-mono text-xs text-amber-800 tracking-widest select-all">
                                  <FaKey className="text-amber-500 shrink-0 text-xs" />
                                  {h.passkey}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  —
                                </span>
                              ),
                              // ─────────────────────────────────────────────────────────────────
                              actions:
                                h.ownerStatus !== "VACCANT" ? (
                                  <RedBtn
                                    onClick={() =>
                                      handleVacateHouse(h.flatNo, h.block)
                                    }
                                  >
                                    <FaTimes className="text-xs" /> Vacate
                                  </RedBtn>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    —
                                  </span>
                                ),
                            }))}
                            emptyIcon="🏢"
                            emptyText="No houses found"
                          />
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── COMPLAINTS ────────────────────────────────────── */}
                  {activeTab === "complaints" &&
                    (() => {
                      const filtered = search(complaints, [
                        "title",
                        "description",
                        "status",
                        "priority",
                        "category",
                      ]);
                      return (
                        <div className="space-y-4">
                          <motion.div
                            className="flex justify-between items-center mb-2"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              All Complaints ({filtered.length})
                            </h3>
                          </motion.div>
                          {filtered.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                              <FaExclamationCircle className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                              <p className="text-gray-500 text-sm sm:text-base">
                                No complaints found
                              </p>
                            </div>
                          ) : (
                            paginate(filtered).map((c) => (
                              <motion.div
                                key={c._id}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{
                                  scale: 1.01,
                                  transition: { duration: 0.2 },
                                }}
                              >
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${PriorityColors[c.priority] || "bg-gray-100 text-gray-800"}`}
                                      >
                                        {c.priority}
                                      </span>
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${StatusColors[c.status] || "bg-gray-100 text-gray-800"}`}
                                      >
                                        {c.status}
                                      </span>
                                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                        {c.category}
                                      </span>
                                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                        {c.nature}
                                      </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-[#0e2a4a] mb-1">
                                      {c.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2">
                                      {c.description}
                                    </p>
                                    {c.residentId && (
                                      <p className="text-xs text-gray-500">
                                        By:{" "}
                                        <span className="font-semibold">
                                          {c.residentId.fullName}
                                        </span>{" "}
                                        — {c.residentId.block}-
                                        {c.residentId.flatNo}
                                      </p>
                                    )}
                                    {c.assignedTo && (
                                      <p className="text-xs text-green-600 mt-1">
                                        Assigned to: {c.assignedTo}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDistanceToNow(
                                        new Date(c.createdAt),
                                        { addSuffix: true },
                                      )}{" "}
                                      · {c.weight || 0} upvotes
                                    </p>
                                  </div>
                                  <div className="ml-0 sm:ml-4 flex flex-row sm:flex-col gap-2">
                                    <GoldBtn
                                      className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                                      onClick={() => {
                                        setComplaintUpdateModal(c);
                                        setComplaintUpdateForm({
                                          status: c.status,
                                          assignedTo: c.assignedTo || "",
                                          priority: c.priority,
                                          adminComment: "",
                                        });
                                      }}
                                    >
                                      <FaEdit className="inline mr-1 text-xs" />{" "}
                                      Update
                                    </GoldBtn>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── NOTICES ───────────────────────────────────────── */}
                  {activeTab === "notices" &&
                    (() => {
                      const filtered = search(notices, [
                        "title",
                        "content",
                        "category",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Notices ({filtered.length})
                            </h3>
                            <GoldBtn onClick={() => setNoticeModal(true)}>
                              <FaPlus className="inline mr-2 text-xs sm:text-sm" />
                              Create Notice
                            </GoldBtn>
                          </motion.div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {filtered.length === 0 ? (
                              <div className="col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                                <FaBell className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-sm sm:text-base">
                                  No notices found
                                </p>
                              </div>
                            ) : (
                              paginate(filtered).map((n) => (
                                <motion.div
                                  key={n._id}
                                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{
                                    y: -3,
                                    transition: { duration: 0.2 },
                                  }}
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${n.category === "EMERGENCY" ? "bg-red-100 text-red-800" : n.category === "EVENT" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                                      >
                                        {n.category}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(
                                          new Date(n.createdAt),
                                          { addSuffix: true },
                                        )}
                                      </span>
                                    </div>
                                    <RedBtn
                                      onClick={() => handleDeleteNotice(n._id)}
                                    >
                                      <FaTrash className="text-xs" />
                                    </RedBtn>
                                  </div>
                                  <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a] mb-2">
                                    {n.title}
                                  </h3>
                                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                    {n.content}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-3">
                                    Expires:{" "}
                                    {new Date(n.expiry).toLocaleDateString()}
                                  </p>
                                </motion.div>
                              ))
                            )}
                          </div>
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── VENDORS ───────────────────────────────────────── */}
                  {activeTab === "vendors" &&
                    (() => {
                      const filtered = search(vendors, [
                        "name",
                        "email",
                        "phone",
                        "address",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Vendors ({filtered.length})
                            </h3>
                            <GoldBtn onClick={() => setVendorModal(true)}>
                              <FaPlus className="inline mr-2 text-xs sm:text-sm" />
                              Add Vendor
                            </GoldBtn>
                          </motion.div>
                          <DataTable
                            columns={[
                              { header: "Name", accessor: "name" },
                              { header: "Phone", accessor: "phone" },
                              { header: "Email", accessor: "email" },
                              { header: "Address", accessor: "address" },
                              { header: "Actions", accessor: "actions" },
                            ]}
                            data={paginate(filtered).map((v) => ({
                              ...v,
                              actions: (
                                <RedBtn
                                  onClick={() => handleDeleteVendor(v._id)}
                                >
                                  <FaTrash className="text-xs" /> Delete
                                </RedBtn>
                              ),
                            }))}
                            emptyIcon="🏪"
                            emptyText="No vendors found"
                          />
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── SERVICES ──────────────────────────────────────── */}
                  {activeTab === "services" &&
                    (() => {
                      const filtered = search(services, [
                        "serviceName",
                        "serviceType",
                        "description",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Services ({filtered.length})
                            </h3>
                            <GoldBtn onClick={() => setServiceModal(true)}>
                              <FaPlus className="inline mr-2 text-xs sm:text-sm" />
                              Add Service
                            </GoldBtn>
                          </motion.div>
                          <DataTable
                            columns={[
                              { header: "Service", accessor: "serviceName" },
                              { header: "Type", accessor: "serviceType" },
                              { header: "Price", accessor: "priceVal" },
                              { header: "Unit", accessor: "unit" },
                              { header: "Vendor", accessor: "vendorName" },
                              { header: "Actions", accessor: "actions" },
                            ]}
                            data={paginate(filtered).map((s) => ({
                              ...s,
                              priceVal: `₹${s.price}`,
                              vendorName: s.vendor?.name || s.vendorId || "—",
                              actions: (
                                <RedBtn
                                  onClick={() => handleDeleteService(s._id)}
                                >
                                  <FaTrash className="text-xs" /> Delete
                                </RedBtn>
                              ),
                            }))}
                            emptyIcon="🔧"
                            emptyText="No services found"
                          />
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}

                  {/* ─── MAINTENANCE ───────────────────────────────────── */}
                  {activeTab === "maintenance" &&
                    (() => {
                      const filtered = search(bills, [
                        "flatNo",
                        "block",
                        "status",
                        "month",
                      ]);
                      return (
                        <div>
                          <motion.div
                            className="flex flex-col justify-between items-start gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                              Maintenance Bills ({filtered.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <GoldBtn onClick={() => setBillModal(true)}>
                                <FaPlus className="inline mr-1 text-xs" />
                                Bulk Generate
                              </GoldBtn>
                              <motion.button
                                onClick={() => setSingleBillModal(true)}
                                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaPlus className="inline mr-1 text-xs" />
                                Single Bill
                              </motion.button>
                              <motion.button
                                onClick={handleMarkOverdue}
                                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaExclamationTriangle className="inline mr-1 text-xs" />
                                Mark Overdue
                              </motion.button>
                            </div>
                          </motion.div>

                          {/* Filter row */}
                          <motion.div
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-3 sm:p-4 mb-6 flex flex-wrap gap-3 border border-white/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <FaFilter className="text-gray-400 self-center text-sm" />
                            <select
                              value={billFilter.status}
                              onChange={(e) =>
                                setBillFilter({
                                  ...billFilter,
                                  status: e.target.value,
                                })
                              }
                              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb703]"
                            >
                              <option value="">All Statuses</option>
                              <option value="UNPAID">Unpaid</option>
                              <option value="PAID">Paid</option>
                              <option value="OVERDUE">Overdue</option>
                              <option value="WAIVED">Waived</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Block"
                              value={billFilter.block}
                              onChange={(e) =>
                                setBillFilter({
                                  ...billFilter,
                                  block: e.target.value,
                                })
                              }
                              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb703] w-20 sm:w-32"
                            />
                            <input
                              type="month"
                              value={billFilter.month}
                              onChange={(e) =>
                                setBillFilter({
                                  ...billFilter,
                                  month: e.target.value,
                                })
                              }
                              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb703]"
                            />
                            <button
                              onClick={() =>
                                setBillFilter({
                                  status: "",
                                  block: "",
                                  month: "",
                                })
                              }
                              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 rounded-lg text-xs sm:text-sm hover:bg-gray-200 transition-colors"
                            >
                              Clear
                            </button>
                          </motion.div>

                          <DataTable
                            columns={[
                              { header: "Flat", accessor: "flat" },
                              { header: "Resident", accessor: "resident" },
                              { header: "Month", accessor: "month" },
                              { header: "Amount", accessor: "amountVal" },
                              { header: "Due Date", accessor: "dueDateVal" },
                              { header: "Status", accessor: "statusBadge" },
                              { header: "Actions", accessor: "actions" },
                            ]}
                            data={paginate(filtered).map((b) => ({
                              ...b,
                              flat: `${b.block}-${b.flatNo}`,
                              resident: b.residentId?.fullName || "—",
                              amountVal: `₹${b.amount}`,
                              dueDateVal: formatDate(b.dateOfDeal),
                              statusBadge: (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${StatusColors[b.status] || "bg-gray-100 text-gray-800"}`}
                                >
                                  {b.status}
                                </span>
                              ),
                              actions: (
                                <div className="flex flex-wrap gap-2">
                                  {b.status !== "PAID" && (
                                    <>
                                      <motion.button
                                        onClick={() => {
                                          setMarkPaidModal(b);
                                          setMarkPaidForm({
                                            paymentMode: "CASH",
                                            transactionId: "",
                                            notes: "",
                                          });
                                        }}
                                        className="px-2 sm:px-3 py-1 sm:py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs sm:text-sm flex items-center gap-1"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <FaCheck className="text-xs" /> Pay
                                      </motion.button>
                                      <motion.button
                                        onClick={() =>
                                          handleSendReminder(b._id)
                                        }
                                        className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-xs sm:text-sm flex items-center gap-1"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <FaBell className="text-xs" /> Remind
                                      </motion.button>
                                    </>
                                  )}
                                  <RedBtn
                                    onClick={() => handleDeleteBill(b._id)}
                                  >
                                    <FaTrash className="text-xs" />
                                  </RedBtn>
                                </div>
                              ),
                            }))}
                            emptyIcon="💰"
                            emptyText="No bills found"
                          />
                          <PaginationControls total={filtered.length} />
                        </div>
                      );
                    })()}
                  {/* ─── NOTIFICATIONS ─────────────────────────────── */}
                  {activeTab === "notifications" &&
                    (() => {
                      const NotifTypeBadgeColors = {
                        VISITOR: "bg-blue-100 text-blue-800",
                        MAINTENANCE: "bg-orange-100 text-orange-800",
                        ANNOUNCEMENT: "bg-purple-100 text-purple-800",
                        COMPLAINT: "bg-red-100 text-red-800",
                        GENERAL: "bg-gray-100 text-gray-800",
                        BILL: "bg-yellow-100 text-yellow-800",
                        EMERGENCY: "bg-red-200 text-red-900",
                      };

                      const filtered = search(notifications, [
                        "title",
                        "message",
                        "type",
                      ]);

                      return (
                        <div>
                          {/* Header row */}
                          <motion.div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg sm:text-xl font-bold text-[#0e2a4a]">
                                Notifications ({filtered.length})
                              </h3>
                              {unreadCount > 0 && (
                                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                  {unreadCount} unread
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <motion.button
                                onClick={handleMarkAllRead}
                                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <FaCheck className="text-xs sm:text-sm" /> Mark All Read
                              </motion.button>
                            </div>
                          </motion.div>

                          {/* Filter chips by type */}
                          <motion.div
                            className="flex flex-wrap gap-2 mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {[
                              "ALL",
                              "VISITOR",
                              "MAINTENANCE",
                              "ANNOUNCEMENT",
                              "COMPLAINT",
                              "BILL",
                              "GENERAL",
                            ].map((t) => (
                              <motion.button
                                key={t}
                                onClick={() =>
                                  setSearchTerm(t === "ALL" ? "" : t)
                                }
                                className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                                  (t === "ALL" && searchTerm === "") ||
                                  searchTerm === t
                                    ? "bg-[#0e2a4a] text-white border-[#0e2a4a]"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#ffb703]"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {t}
                              </motion.button>
                            ))}
                          </motion.div>

                          {/* Cards */}
                          {filtered.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-12 text-center">
                              <FaBellIcon className="text-4xl sm:text-5xl mx-auto mb-4 text-gray-300" />
                              <p className="text-gray-500 text-sm sm:text-base">
                                No notifications found
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {paginate(filtered).map((n) => (
                                <motion.div
                                  key={n._id}
                                  className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-5 border transition-all duration-200 ${
                                    !n.isRead
                                      ? "border-l-4 border-l-[#ffb703] border-r border-t border-b border-white/20"
                                      : "border border-white/20 opacity-75"
                                  }`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  whileHover={{ scale: 1.002 }}
                                >
                                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                                    {/* Left: icon + content */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                                      {/* Unread dot */}
                                      <div className="mt-1 shrink-0">
                                        {!n.isRead ? (
                                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ffb703] shadow-sm shadow-yellow-300" />
                                        ) : (
                                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-200" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        {/* Type badge + broadcast tag + time */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <span
                                            className={`px-2 py-0.5 text-xs rounded-full font-semibold ${NotifTypeBadgeColors[n.type] || "bg-gray-100 text-gray-800"}`}
                                          >
                                            {n.type}
                                          </span>
                                          {n.isBroadcast && (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                                              📢 Broadcast
                                            </span>
                                          )}
                                          {!n.isRead && (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">
                                              New
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-400 ml-auto">
                                            {formatDistanceToNow(
                                              new Date(n.createdAt),
                                              { addSuffix: true },
                                            )}
                                          </span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="font-bold text-[#0e2a4a] text-sm sm:text-base mb-1 truncate">
                                          {n.title}
                                        </h4>

                                        {/* Message preview */}
                                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                                          {n.message}
                                        </p>

                                        {/* Recipient info */}
                                        {n.recipientId && (
                                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <FaUsers className="text-gray-300 text-xs" />
                                            {n.recipientId.fullName} —{" "}
                                            {n.recipientId.block}-
                                            {n.recipientId.flatNo}
                                          </p>
                                        )}

                                        {/* Read timestamp */}
                                        {n.isRead && n.readAt && (
                                          <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                            <FaCheckCircle className="text-xs" />
                                            Read{" "}
                                            {formatDistanceToNow(
                                              new Date(n.readAt),
                                              { addSuffix: true },
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: action buttons */}
                                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                                      {/* View detail */}
                                      <motion.button
                                        onClick={() => setNotifDetailModal(n)}
                                        className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <FaEye className="text-xs" /> View
                                      </motion.button>

                                      {/* Mark as read (only if unread) */}
                                      {!n.isRead && (
                                        <motion.button
                                          onClick={() =>
                                            handleMarkOneRead(n._id)
                                          }
                                          className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <FaCheck className="text-xs" /> Read
                                        </motion.button>
                                      )}

                                      {/* Delete */}
                                      <RedBtn
                                        className="flex-1 sm:flex-none justify-center"
                                        onClick={() =>
                                          handleDeleteNotification(n._id)
                                        }
                                      >
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
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────────── */}

      {/* Add Guard */}
      <Modal
        open={guardModal}
        onClose={() => setGuardModal(false)}
        title="Add Security Guard"
      >
        <div className="space-y-4">
          <InputField
            label="Full Name"
            value={guardForm.fullName}
            onChange={(e) =>
              setGuardForm({ ...guardForm, fullName: e.target.value })
            }
            placeholder="Guard's full name"
          />
          <InputField
            label="Phone"
            type="tel"
            value={guardForm.phone}
            onChange={(e) =>
              setGuardForm({ ...guardForm, phone: e.target.value })
            }
            placeholder="10-digit phone"
          />
          <SelectField
            label="Shift"
            value={guardForm.shift}
            onChange={(e) =>
              setGuardForm({ ...guardForm, shift: e.target.value })
            }
            options={[
              { value: "DAY", label: "Day" },
              { value: "EVENING", label: "Evening" },
              { value: "NIGHT", label: "Night" },
            ]}
          />
          <SelectField
            label="Status"
            value={guardForm.status}
            onChange={(e) =>
              setGuardForm({ ...guardForm, status: e.target.value })
            }
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "ON LEAVE", label: "On Leave" },
            ]}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setGuardModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleAddGuard}>Add Guard</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Edit Guard */}
      <Modal
        open={!!guardEditModal}
        onClose={() => setGuardEditModal(null)}
        title="Edit Guard"
      >
        {guardEditModal && (
          <div className="space-y-4">
            <InputField
              label="Full Name"
              value={guardEditModal.fullName}
              onChange={(e) =>
                setGuardEditModal({
                  ...guardEditModal,
                  fullName: e.target.value,
                })
              }
            />
            <InputField
              label="Phone"
              value={guardEditModal.phone}
              onChange={(e) =>
                setGuardEditModal({ ...guardEditModal, phone: e.target.value })
              }
            />
            <SelectField
              label="Shift"
              value={guardEditModal.shift}
              onChange={(e) =>
                setGuardEditModal({ ...guardEditModal, shift: e.target.value })
              }
              options={[
                { value: "DAY", label: "Day" },
                { value: "EVENING", label: "Evening" },
                { value: "NIGHT", label: "Night" },
              ]}
            />
            <SelectField
              label="Status"
              value={guardEditModal.status}
              onChange={(e) =>
                setGuardEditModal({ ...guardEditModal, status: e.target.value })
              }
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "ON LEAVE", label: "On Leave" },
              ]}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setGuardEditModal(null)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <GoldBtn onClick={handleUpdateGuard}>Save Changes</GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add House */}
      <Modal
        open={houseModal}
        onClose={() => setHouseModal(false)}
        title="Add New House"
      >
        <div className="space-y-4">
          <InputField
            label="Flat No."
            value={houseForm.flatNo}
            onChange={(e) =>
              setHouseForm({ ...houseForm, flatNo: e.target.value })
            }
            placeholder="e.g. 101"
          />
          <InputField
            label="Block"
            value={houseForm.block}
            onChange={(e) =>
              setHouseForm({ ...houseForm, block: e.target.value })
            }
            placeholder="e.g. A"
          />
          <InputField
            label="Email"
            value={houseForm.email}
            onChange={(e) =>
              setHouseForm({ ...houseForm, email: e.target.value })
            }
            placeholder="Add Email"
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setHouseModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleAddHouse}>Add House</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Allot House */}
      <Modal
        open={allotModal}
        onClose={() => setAllotModal(false)}
        title="Allot House"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Flat No."
            value={allotForm.flatNo}
            onChange={(e) =>
              setAllotForm({ ...allotForm, flatNo: e.target.value })
            }
            placeholder="101"
          />
          <InputField
            label="Block"
            value={allotForm.block}
            onChange={(e) =>
              setAllotForm({ ...allotForm, block: e.target.value })
            }
            placeholder="A"
          />
          <SelectField
            label="Ownership"
            value={allotForm.ownerStatus}
            onChange={(e) =>
              setAllotForm({ ...allotForm, ownerStatus: e.target.value })
            }
            options={[
              { value: "SOLD", label: "Sold" },
              { value: "RENTED", label: "Rented" },
            ]}
          />
          <InputField
            label="Full Name"
            value={allotForm.fullName}
            onChange={(e) =>
              setAllotForm({ ...allotForm, fullName: e.target.value })
            }
            placeholder="Owner name"
          />
          <InputField
            label="Registry No."
            value={allotForm.registry}
            onChange={(e) =>
              setAllotForm({ ...allotForm, registry: e.target.value })
            }
            placeholder="Registry ID"
          />
          <InputField
            label="Phone"
            value={allotForm.phone}
            onChange={(e) =>
              setAllotForm({ ...allotForm, phone: e.target.value })
            }
            placeholder="10-digit"
          />
          <div className="col-span-1 sm:col-span-2">
            <InputField
              label="Email"
              type="email"
              value={allotForm.email}
              onChange={(e) =>
                setAllotForm({ ...allotForm, email: e.target.value })
              }
              placeholder="owner@email.com"
            />
          </div>
          <InputField
            label="Nominee"
            value={allotForm.nominee}
            onChange={(e) =>
              setAllotForm({ ...allotForm, nominee: e.target.value })
            }
            placeholder="Nominee name"
          />
          {allotForm.ownerStatus === "RENTED" && (
            <InputField
              label="Tenure"
              value={allotForm.tenure}
              onChange={(e) =>
                setAllotForm({ ...allotForm, tenure: e.target.value })
              }
              placeholder="e.g. 11 months"
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={() => setAllotModal(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
          <GoldBtn onClick={handleAllotHouse}>Allot House</GoldBtn>
        </div>
      </Modal>

      {/* Create Notice */}
      <Modal
        open={noticeModal}
        onClose={() => setNoticeModal(false)}
        title="Create Notice / Announcement"
      >
        <div className="space-y-4">
          <InputField
            label="Title"
            value={noticeForm.title}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, title: e.target.value })
            }
            placeholder="Notice title"
          />
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Content
            </label>
            <textarea
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all resize-none text-sm sm:text-base"
              rows="4"
              value={noticeForm.content}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, content: e.target.value })
              }
              placeholder="Notice content..."
            />
          </div>
          <SelectField
            label="Category"
            value={noticeForm.category}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, category: e.target.value })
            }
            options={[
              { value: "GENERAL", label: "General" },
              { value: "EVENT", label: "Event" },
              { value: "EMERGENCY", label: "Emergency" },
              { value: "MAINTENANCE", label: "Maintenance" },
            ]}
          />
          <InputField
            label="Expiry Date"
            type="date"
            value={noticeForm.expiry}
            onChange={(e) =>
              setNoticeForm({ ...noticeForm, expiry: e.target.value })
            }
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setNoticeModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleCreateNotice}>Create & Notify</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Update Complaint */}
      <Modal
        open={!!complaintUpdateModal}
        onClose={() => setComplaintUpdateModal(null)}
        title="Update Complaint"
      >
        {complaintUpdateModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <p className="font-semibold text-[#0e2a4a] text-sm sm:text-base">
                {complaintUpdateModal.title}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {complaintUpdateModal.description}
              </p>
            </div>
            <SelectField
              label="Status"
              value={complaintUpdateForm.status}
              onChange={(e) =>
                setComplaintUpdateForm({
                  ...complaintUpdateForm,
                  status: e.target.value,
                })
              }
              options={[
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />
            <SelectField
              label="Priority"
              value={complaintUpdateForm.priority}
              onChange={(e) =>
                setComplaintUpdateForm({
                  ...complaintUpdateForm,
                  priority: e.target.value,
                })
              }
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <InputField
              label="Assign To"
              value={complaintUpdateForm.assignedTo}
              onChange={(e) =>
                setComplaintUpdateForm({
                  ...complaintUpdateForm,
                  assignedTo: e.target.value,
                })
              }
              placeholder="Assignee name"
            />
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Admin Comment (optional)
              </label>
              <textarea
                className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base"
                rows="3"
                value={complaintUpdateForm.adminComment}
                onChange={(e) =>
                  setComplaintUpdateForm({
                    ...complaintUpdateForm,
                    adminComment: e.target.value,
                  })
                }
                placeholder="Add a comment for the resident..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setComplaintUpdateModal(null)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <GoldBtn onClick={handleUpdateComplaint}>Update & Notify</GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Vendor */}
      <Modal
        open={vendorModal}
        onClose={() => setVendorModal(false)}
        title="Add Vendor"
      >
        <div className="space-y-4">
          <InputField
            label="Company Name"
            value={vendorForm.name}
            onChange={(e) =>
              setVendorForm({ ...vendorForm, name: e.target.value })
            }
            placeholder="e.g. CleanCity Services"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Phone"
              value={vendorForm.phone}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, phone: e.target.value })
              }
              placeholder="10-digit"
            />
            <InputField
              label="Email"
              type="email"
              value={vendorForm.email}
              onChange={(e) =>
                setVendorForm({ ...vendorForm, email: e.target.value })
              }
              placeholder="vendor@email.com"
            />
          </div>
          <InputField
            label="Address"
            value={vendorForm.address}
            onChange={(e) =>
              setVendorForm({ ...vendorForm, address: e.target.value })
            }
            placeholder="Full address"
          />
          <InputField
            label="Documents (URL or ref)"
            value={vendorForm.documents}
            onChange={(e) =>
              setVendorForm({ ...vendorForm, documents: e.target.value })
            }
            placeholder="Document reference"
          />
          <InputField
            label="Added By"
            value={vendorForm.adder}
            onChange={(e) =>
              setVendorForm({ ...vendorForm, adder: e.target.value })
            }
            placeholder="Admin name"
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setVendorModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleAddVendor}>Add Vendor</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Add Service */}
      <Modal
        open={serviceModal}
        onClose={() => setServiceModal(false)}
        title="Add Service"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Service Name"
            value={serviceForm.serviceName}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, serviceName: e.target.value })
            }
            placeholder="e.g. Plumbing Repair"
          />
          <InputField
            label="Service Type"
            value={serviceForm.serviceType}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, serviceType: e.target.value })
            }
            placeholder="e.g. PLUMBING"
          />
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Description
            </label>
            <textarea
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base"
              rows="2"
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, description: e.target.value })
              }
              placeholder="Service description"
            />
          </div>
          <InputField
            label="Price (₹)"
            type="number"
            value={serviceForm.price}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, price: e.target.value })
            }
            placeholder="500"
          />
          <InputField
            label="Unit"
            value={serviceForm.unit}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, unit: e.target.value })
            }
            placeholder="e.g. per visit"
          />
          <InputField
            label="Turns / Slots"
            value={serviceForm.turns}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, turns: e.target.value })
            }
            placeholder="e.g. 10"
          />
          <InputField
            label="Contact"
            value={serviceForm.contact}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, contact: e.target.value })
            }
            placeholder="Contact phone"
          />
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Vendor
            </label>
            <select
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] text-sm sm:text-base"
              value={serviceForm.vendorId}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, vendorId: e.target.value })
              }
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={() => setServiceModal(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
          <GoldBtn onClick={handleAddService}>Add Service</GoldBtn>
        </div>
      </Modal>

      {/* Bulk Generate Bills */}
      <Modal
        open={billModal}
        onClose={() => setBillModal(false)}
        title="Generate Monthly Bills (All Flats)"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-200">
            <p className="text-xs sm:text-sm text-amber-800">
              This will generate bills for ALL occupied flats. Existing bills
              for the selected month will be skipped.
            </p>
          </div>
          <InputField
            label="Amount (₹)"
            type="number"
            value={billForm.amount}
            onChange={(e) =>
              setBillForm({ ...billForm, amount: e.target.value })
            }
            placeholder="e.g. 2500"
          />
          <InputField
            label="Due Date"
            type="date"
            value={billForm.dueDate}
            onChange={(e) =>
              setBillForm({ ...billForm, dueDate: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Month (optional, defaults to current)
            </label>
            <input
              type="month"
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] text-sm sm:text-base"
              value={billForm.month}
              onChange={(e) =>
                setBillForm({ ...billForm, month: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setBillModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleGenerateBills}>Generate Bills</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Single Bill */}
      <Modal
        open={singleBillModal}
        onClose={() => setSingleBillModal(false)}
        title="Generate Single Bill"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Flat No."
              value={singleBillForm.flatNo}
              onChange={(e) =>
                setSingleBillForm({ ...singleBillForm, flatNo: e.target.value })
              }
              placeholder="101"
            />
            <InputField
              label="Block"
              value={singleBillForm.block}
              onChange={(e) =>
                setSingleBillForm({ ...singleBillForm, block: e.target.value })
              }
              placeholder="A"
            />
          </div>
          <InputField
            label="Amount (₹)"
            type="number"
            value={singleBillForm.amount}
            onChange={(e) =>
              setSingleBillForm({ ...singleBillForm, amount: e.target.value })
            }
            placeholder="2500"
          />
          <InputField
            label="Due Date"
            type="date"
            value={singleBillForm.dueDate}
            onChange={(e) =>
              setSingleBillForm({ ...singleBillForm, dueDate: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Month (optional)
            </label>
            <input
              type="month"
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] text-sm sm:text-base"
              value={singleBillForm.month}
              onChange={(e) =>
                setSingleBillForm({ ...singleBillForm, month: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setSingleBillModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleGenerateSingleBill}>Generate Bill</GoldBtn>
          </div>
        </div>
      </Modal>

      {/* Mark Paid */}
      <Modal
        open={!!markPaidModal}
        onClose={() => setMarkPaidModal(null)}
        title="Mark Bill as Paid"
      >
        {markPaidModal && (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
              <p className="text-xs sm:text-sm text-green-800">
                Flat:{" "}
                <strong>
                  {markPaidModal.block}-{markPaidModal.flatNo}
                </strong>{" "}
                · Month: <strong>{markPaidModal.month}</strong> · Amount:{" "}
                <strong>₹{markPaidModal.amount}</strong>
              </p>
            </div>
            <SelectField
              label="Payment Mode"
              value={markPaidForm.paymentMode}
              onChange={(e) =>
                setMarkPaidForm({
                  ...markPaidForm,
                  paymentMode: e.target.value,
                })
              }
              options={[
                { value: "CASH", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "BANK_TRANSFER", label: "Bank Transfer" },
                { value: "ONLINE", label: "Online" },
              ]}
            />
            <InputField
              label="Transaction ID (optional)"
              value={markPaidForm.transactionId}
              onChange={(e) =>
                setMarkPaidForm({
                  ...markPaidForm,
                  transactionId: e.target.value,
                })
              }
              placeholder="TXN123456"
            />
            <InputField
              label="Notes (optional)"
              value={markPaidForm.notes}
              onChange={(e) =>
                setMarkPaidForm({ ...markPaidForm, notes: e.target.value })
              }
              placeholder="Any notes"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setMarkPaidModal(null)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <GoldBtn onClick={handleMarkPaid}>
                <FaCheck className="inline mr-2 text-xs sm:text-sm" />
                Confirm Payment
              </GoldBtn>
            </div>
          </div>
        )}
      </Modal>

      {/* Broadcast */}
      <Modal
        open={broadcastModal}
        onClose={() => setBroadcastModal(false)}
        title="Broadcast to All Residents"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-800">
              This message will be sent via Socket.IO + Email to all active
              residents.
            </p>
          </div>
          <InputField
            label="Title"
            value={broadcastForm.title}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, title: e.target.value })
            }
            placeholder="Broadcast title"
          />
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Message
            </label>
            <textarea
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] resize-none text-sm sm:text-base"
              rows="4"
              value={broadcastForm.message}
              onChange={(e) =>
                setBroadcastForm({ ...broadcastForm, message: e.target.value })
              }
              placeholder="Your announcement..."
            />
          </div>
          <SelectField
            label="Type"
            value={broadcastForm.type}
            onChange={(e) =>
              setBroadcastForm({ ...broadcastForm, type: e.target.value })
            }
            options={[
              { value: "ANNOUNCEMENT", label: "Announcement" },
              { value: "MAINTENANCE", label: "Maintenance" },
              { value: "EMERGENCY", label: "Emergency" },
              { value: "GENERAL", label: "General" },
            ]}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={() => setBroadcastModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <GoldBtn onClick={handleBroadcast}>
              <FaPaperPlane className="inline mr-2 text-xs sm:text-sm" />
              Send Broadcast
            </GoldBtn>
          </div>
        </div>
      </Modal>
      {/* Notification Detail */}
      <Modal
        open={!!notifDetailModal}
        onClose={() => setNotifDetailModal(null)}
        title="Notification Detail"
      >
        {notifDetailModal &&
          (() => {
            const NotifTypeBadgeColors = {
              VISITOR: "bg-blue-100 text-blue-800",
              MAINTENANCE: "bg-orange-100 text-orange-800",
              ANNOUNCEMENT: "bg-purple-100 text-purple-800",
              COMPLAINT: "bg-red-100 text-red-800",
              GENERAL: "bg-gray-100 text-gray-800",
              BILL: "bg-yellow-100 text-yellow-800",
              EMERGENCY: "bg-red-200 text-red-900",
            };
            return (
              <div className="space-y-4 sm:space-y-5">
                {/* Type + broadcast badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${NotifTypeBadgeColors[notifDetailModal.type] || "bg-gray-100 text-gray-800"}`}
                  >
                    {notifDetailModal.type}
                  </span>
                  {notifDetailModal.isBroadcast && (
                    <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      📢 Broadcast
                    </span>
                  )}
                  <span
                    className={`px-2 sm:px-3 py-1 text-xs rounded-full font-bold ${notifDetailModal.isRead ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {notifDetailModal.isRead ? "✓ Read" : "Unread"}
                  </span>
                </div>

                {/* Title */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Title
                  </p>
                  <p className="font-bold text-[#0e2a4a] text-base sm:text-lg">
                    {notifDetailModal.title}
                  </p>
                </div>

                {/* Message */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Message
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {notifDetailModal.message}
                  </p>
                </div>

                {/* Recipient */}
                {notifDetailModal.recipientId && (
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                      Recipient
                    </p>
                    <p className="font-semibold text-[#0e2a4a] text-sm sm:text-base">
                      {notifDetailModal.recipientId.fullName} —{" "}
                      {notifDetailModal.recipientId.block}-
                      {notifDetailModal.recipientId.flatNo}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Sent
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      {format(
                        new Date(notifDetailModal.createdAt),
                        "dd MMM yyyy, hh:mm a",
                      )}
                    </p>
                  </div>
                  {notifDetailModal.isRead && notifDetailModal.readAt && (
                    <div className="bg-green-50 p-2 sm:p-3 rounded-xl">
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
                        Read At
                      </p>
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        {format(
                          new Date(notifDetailModal.readAt),
                          "dd MMM yyyy, hh:mm a",
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  {!notifDetailModal.isRead && (
                    <GoldBtn
                      className="w-full sm:w-auto justify-center"
                      onClick={() => {
                        handleMarkOneRead(notifDetailModal._id);
                        setNotifDetailModal(null);
                      }}
                    >
                      <FaCheck className="inline mr-2 text-xs sm:text-sm" /> Mark as Read
                    </GoldBtn>
                  )}
                  <RedBtn
                    className="w-full sm:w-auto justify-center"
                    onClick={() => {
                      handleDeleteNotification(notifDetailModal._id);
                      setNotifDetailModal(null);
                    }}
                  >
                    <FaTrash className="text-xs mr-2" /> Delete
                  </RedBtn>
                  <button
                    onClick={() => setNotifDetailModal(null)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
};

export default AdminDashboard;