
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow, format } from "date-fns";
import QRScanner from "../../components/QRScanner";
import logo from "../../assets/logo5.png";
import {
  FaShieldAlt,
  FaUsers,
  FaClock,
  FaSignOutAlt,
  FaSearch,
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBars,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaQrcode,
  FaUserPlus,
  FaChevronLeft,
  FaChevronRight,
  FaDoorOpen,
  FaDoorClosed,
  FaFilter,
  FaEye,
  FaBell,
  FaUserTie,
  FaCalendarAlt,
  FaPhoneAlt,
  FaBuilding,
  FaCar,
  FaCamera,
  FaClipboardList,
  FaVideo,
  FaRedo,
  FaUpload,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { MdPending, MdOutlineVerified } from "react-icons/md";
import { Link } from "react-router-dom";

const BASE = `${import.meta.env.VITE_API_URL}`;

// ─── Color Maps ──────────────────────────────────────────────────────────────
const StatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  CHECKED_OUT: "bg-gray-100 text-gray-800",
  EXPIRED: "bg-orange-100 text-orange-800",
};

const MethodColors = {
  QR: "bg-purple-100 text-purple-800",
  MANUAL: "bg-blue-100 text-blue-800",
  DIRECT: "bg-gray-100 text-gray-800",
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
const DashboardCard = ({ title, value, icon, color, delay = 0, sub }) => (
  <motion.div
    className={`p-5 md:p-6 rounded-2xl shadow-lg bg-gradient-to-r ${color} text-white flex items-center justify-between relative overflow-hidden group cursor-pointer`}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <p className="text-xs md:text-sm font-medium opacity-90 mb-1">{title}</p>
      <motion.h3
        className="text-2xl md:text-3xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
      >
        {value}
      </motion.h3>
      {sub && <p className="text-[10px] md:text-xs opacity-70 mt-1">{sub}</p>}
    </div>
    <motion.div
      className="p-3 md:p-4 rounded-full bg-white/20 backdrop-blur-sm relative z-10"
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
    >
      {icon}
    </motion.div>
  </motion.div>
);

const Modal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-5 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-white/20 max-h-[95vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-[#0e2a4a]">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <FaTimes />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InputField = ({ label, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
        {label}
      </label>
    )}
    <input
      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all text-sm md:text-base"
      {...props}
    />
  </div>
);

const GoldBtn = ({ children, className = "", ...props }) => (
  <motion.button
    className={`px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${className}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    {...props}
  >
    {children}
  </motion.button>
);

const RedBtn = ({ children, className = "", ...props }) => (
  <motion.button
    className={`px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-1 text-xs md:text-sm transition-all duration-300 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
);

const GreenBtn = ({ children, className = "", ...props }) => (
  <motion.button
    className={`px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-1 text-xs md:text-sm transition-all duration-300 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SecurityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Data
  const [securityStats, setSecurityStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [residents, setResidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modals
  const [addVisitorModal, setAddVisitorModal] = useState(false);
  const [visitorDetailModal, setVisitorDetailModal] = useState(null);

  // Forms
  const [addVisitorForm, setAddVisitorForm] = useState({
    fullName: "",
    phone: "",
    visitorFor: "",
    purpose: "General Visit",
    flatNo: "",
    block: "",
    residentId: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleReg: "",
  });
  const [qrForm, setQrForm] = useState({
    qrToken: "",
    fullName: "",
    phone: "",
    purpose: "General Visit",
  });

  // Camera / photo state
  const [addMode, setAddMode] = useState("manual"); 
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [photoSource, setPhotoSource] = useState("none");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
    fetchResidents();
  }, []);

  // ─── API ─────────────────────────────────────────────────────────────────────
  const api = useCallback(async (method, url, data = null) => {
    const config = { withCredentials: true };
    if (method === "get") return axios.get(`${BASE}${url}`, config);
    if (method === "post") return axios.post(`${BASE}${url}`, data, config);
    if (method === "patch") return axios.patch(`${BASE}${url}`, data, config);
    if (method === "delete") return axios.delete(`${BASE}${url}`, config);
  }, []);

  const fetchSecurityStats = async () => {
    try {
      const r = await api("get", "/analytics/security");
      if (r.data.success) setSecurityStats(r.data.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const fetchVisitors = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      const r = await api("get", `/guard/visitor?${params.toString()}`);
      if (r.data.success) setVisitors(r.data.visitors || []);
    } catch (err) {
      console.error("Visitors error:", err);
      setVisitors([]);
    }
  };

  const fetchResidents = async () => {
    try {
      const r = await api("get", "/resident/all");
      if (Array.isArray(r.data)) {
        setResidents(r.data);
      } else if (r.data?.residents) {
        setResidents(r.data.residents);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        switch (activeTab) {
          case "dashboard":
            await fetchSecurityStats();
            break;
          default:
            await fetchVisitors();
            await fetchResidents();
            break;
        }
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "dashboard") fetchVisitors();
  }, [statusFilter, dateFilter]);

  const handleLogout = async () => {
    try {
      await api("post", "/user/guard/logout");
      localStorage.removeItem("guard");
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      toast.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        setCapturedBlob(new File([blob], "visitor_capture.jpg", { type: "image/jpeg" }));
      });
    stopCamera();
    setPhotoSource("camera");
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
    setPhotoSource("none");
    startCamera();
  };

  const clearPhoto = () => {
    setCapturedPhoto(null);
    setCapturedBlob(null);
    setUploadedFile(null);
    setPhotoSource("none");
    stopCamera();
  };

  const closeAddVisitorModal = () => {
    stopCamera();
    clearPhoto();
    setAddVisitorModal(false);
    setAddMode("manual");
  };

  const handleAddVisitor = async () => {
    try {
      const photoFile = photoSource === "camera" ? capturedBlob : (photoSource === "upload" ? uploadedFile : null);
      const formData = new FormData();
      formData.append("fullName", addVisitorForm.fullName);
      formData.append("phone", addVisitorForm.phone);
      formData.append("visitorFor", addVisitorForm.visitorFor);
      formData.append("purpose", addVisitorForm.purpose);
      formData.append("residentId", addVisitorForm.residentId);

      let flatNo = addVisitorForm.flatNo;
      let block = addVisitorForm.block;
      if (!flatNo || !block) {
        const sel = residents.find((r) => r._id === addVisitorForm.residentId);
        if (sel) { flatNo = sel.flatNo; block = sel.block; }
      }
      formData.append("flatNo", flatNo);
      formData.append("block", block);

      if (addVisitorForm.vehicleType) {
        formData.append("vehicleDetails", JSON.stringify([{
          type: addVisitorForm.vehicleType,
          model: addVisitorForm.vehicleModel,
          color: addVisitorForm.vehicleColor,
          registrationNumber: addVisitorForm.vehicleReg,
        }]));
      }

      if (photoFile) formData.append("photo", photoFile);

      const r = await axios.post(`${BASE}/guard/visitor/add`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (r.data.success) {
        toast.success("Visitor added successfully");
        closeAddVisitorModal();
        setAddVisitorForm({
          fullName: "", phone: "", visitorFor: "", purpose: "General Visit",
          flatNo: "", block: "", residentId: "", vehicleType: "",
          vehicleModel: "", vehicleColor: "", vehicleReg: "",
        });
        fetchVisitors();
        fetchSecurityStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add visitor");
    }
  };

  const handleQRScan = async () => {
    try {
      if (!qrForm.qrToken) { toast.error("QR token is required"); return; }
      const photoFile = photoSource === "camera" ? capturedBlob : (photoSource === "upload" ? uploadedFile : null);
      
      let res;
      if (photoFile) {
        const formData = new FormData();
        formData.append("qrToken", qrForm.qrToken);
        formData.append("fullName", qrForm.fullName);
        formData.append("phone", qrForm.phone);
        formData.append("purpose", qrForm.purpose);
        formData.append("photo", photoFile);
        res = await axios.post(`${BASE}/qr/scan`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${BASE}/qr/scan`, {
          qrToken: qrForm.qrToken,
          fullName: qrForm.fullName,
          phone: qrForm.phone,
          purpose: qrForm.purpose,
        }, { withCredentials: true });
      }

      if (res.data.success) {
        toast.success("QR Check-in successful");
        setAddVisitorModal(false);
        clearPhoto();
        setQrForm({ qrToken: "", fullName: "", phone: "", purpose: "General Visit" });
        fetchVisitors();
        fetchSecurityStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "QR scan failed");
    }
  };

  const handleApproveVisitor = async (visitorId, action) => {
    try {
      const r = await api("patch", `/guard/visitor/approve/${visitorId}`, { action });
      if (r.data.success) {
        toast.success(`Visitor ${action.toLowerCase()}d`);
        fetchVisitors();
        fetchSecurityStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleMarkExit = async (visitorId) => {
    if (!window.confirm("Mark this visitor as exited?")) return;
    try {
      const r = await api("patch", `/guard/visitor/exit/${visitorId}`);
      if (r.data.success) {
        toast.success("Exit recorded");
        fetchVisitors();
        fetchSecurityStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const search = (arr, keys) =>
    arr.filter((item) =>
      keys.some((k) =>
        String(item[k] || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const paginate = (data) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const PaginationControls = ({ total }) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 px-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-full md:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-[#ffb703] text-[#0e2a4a] hover:shadow-lg"}`}
        >
          <FaChevronLeft /> Previous
        </button>
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${currentPage === p ? "bg-[#0e2a4a] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-full md:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-[#ffb703] text-[#0e2a4a] hover:shadow-lg"}`}
        >
          Next <FaChevronRight />
        </button>
      </div>
    );
  };

  const sidebarItems = [
    { key: "dashboard", icon: FaShieldAlt, label: "Dashboard" },
    { key: "visitors", icon: FaUsers, label: "All Visitors" },
    { key: "inside", icon: FaDoorOpen, label: "Currently Inside" },
    { key: "pending", icon: MdPending, label: "Pending Approvals" },
  ];

  const guardUser = JSON.parse(localStorage.getItem("guard") || "{}");
  const insideVisitors = visitors.filter((v) => v.status === "CHECKED_IN");
  const pendingVisitors = visitors.filter((v) => v.status === "PENDING");

  const getTabData = () => {
    if (activeTab === "inside") return insideVisitors;
    if (activeTab === "pending") return pendingVisitors;
    return visitors;
  };

  const filteredData = search(getTabData(), ["fullName", "phone", "flatNo", "block", "visitorFor", "purpose", "status"]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative overflow-hidden">
      <ToastContainer position="top-right" theme="light" autoClose={3000} />

      {/* Navbar */}
      <motion.nav 
        className="bg-[#0e2a4a] text-white shadow-xl z-[60] sticky top-0"
        initial={{ y: -100 }} animate={{ y: 0 }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden bg-[#ffb703]/20 flex items-center justify-center shrink-0">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              UrbanNest
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <GoldBtn onClick={() => setAddVisitorModal(true)} className="!py-2 !text-sm">
              <FaUserPlus /> Add Visitor
            </GoldBtn>
            <button 
              onClick={() => { setAddMode("qr"); setAddVisitorModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-xl hover:bg-purple-500/30 transition-all text-sm font-semibold"
            >
              <FaQrcode /> Scan QR
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-sm font-semibold">
              <FaSignOutAlt /> Logout
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-2xl">
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Responsive Overlay for mobile) */}
        <AnimatePresence>
          {(mobileOpen || window.innerWidth >= 1024) && (
            <motion.aside
              className="fixed lg:static inset-y-0 left-0 w-72 bg-white shadow-2xl lg:shadow-none z-[55] lg:z-10 flex flex-col border-r border-gray-200"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[#0e2a4a] mb-1">
                  <FaShieldAlt className="text-[#ffb703] text-xl" />
                  <h1 className="font-bold text-lg">Guard Portal</h1>
                </div>
                <p className="text-xs text-gray-500 font-medium">{guardUser?.fullName || "Security Guard"}</p>
                <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg w-fit">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-600 uppercase">On Duty</span>
                </div>
              </div>

              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1.5">
                  {sidebarItems.map((item) => (
                    <li key={item.key}>
                      <button
                        onClick={() => { setActiveTab(item.key); setMobileOpen(false); setCurrentPage(1); }}
                        className={`w-full flex items-center p-3.5 rounded-xl transition-all font-semibold text-sm ${activeTab === item.key ? "bg-[#ffb703] text-[#0e2a4a] shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        <item.icon className="mr-3 text-lg" />
                        {item.label}
                        {item.key === "pending" && pendingVisitors.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingVisitors.length}</span>
                        )}
                        {item.key === "inside" && insideVisitors.length > 0 && (
                          <span className="ml-auto bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">{insideVisitors.length}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 lg:hidden space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Quick Actions</p>
                  <GoldBtn onClick={() => setAddVisitorModal(true)} className="w-full">
                    <FaUserPlus /> Add Visitor
                  </GoldBtn>
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Dashboard Header */}
          <header className="bg-white border-b border-gray-200 p-4 md:p-6 shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#0e2a4a] capitalize">
                {sidebarItems.find(s => s.key === activeTab)?.label || "Dashboard"}
              </h2>
              {activeTab !== "dashboard" && (
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="Search records..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ffb703] outline-none transition-all text-sm"
                    value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
                  <FaSpinner className="animate-spin text-4xl text-[#ffb703]" />
                  <p className="font-semibold">Syncing Security Data...</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
                  
                  {activeTab === "dashboard" && (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <DashboardCard title="Today's Total" value={securityStats?.counts?.todayTotal ?? "0"} icon={<FaUsers className="text-xl md:text-2xl"/>} color="from-blue-600 to-blue-700" sub="Check-ins today" />
                        <DashboardCard title="Inside Now" value={securityStats?.counts?.insideCount ?? "0"} icon={<FaDoorOpen className="text-xl md:text-2xl"/>} color="from-green-600 to-green-700" sub="Active visitors" />
                        <DashboardCard title="Pending" value={securityStats?.counts?.pendingCount ?? "0"} icon={<FaClock className="text-xl md:text-2xl"/>} color="from-orange-500 to-orange-600" sub="Awaiting approval" />
                        <DashboardCard title="System Status" value="Online" icon={<FaShieldAlt className="text-xl md:text-2xl"/>} color="from-[#0e2a4a] to-[#1a4b7a]" sub="All gates active" />
                      </div>

                      {/* Split View for Desktop / Stacked for Mobile */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Inside List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4 bg-green-600 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><FaDoorOpen/> Live Inside</h3>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{securityStats?.counts?.insideCount ?? 0}</span>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                            {securityStats?.currentlyInside?.length > 0 ? (
                              securityStats.currentlyInside.map(v => (
                                <div key={v._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                  <div>
                                    <p className="font-bold text-sm text-[#0e2a4a]">{v.fullName}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{v.block}-{v.flatNo} • {v.purpose}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-medium">{v.entryTime ? formatDistanceToNow(new Date(v.entryTime), {addSuffix: true}) : "Just now"}</p>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">{v.approvalMethod}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center text-gray-400"><FaDoorClosed className="mx-auto text-3xl mb-2 opacity-20"/> <p className="text-sm font-medium">No one is inside right now</p></div>
                            )}
                          </div>
                        </div>

                        {/* Pending List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4 bg-orange-500 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><FaClock/> Waiting Approval</h3>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{securityStats?.counts?.pendingCount ?? 0}</span>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                            {securityStats?.pendingApprovals?.length > 0 ? (
                              securityStats.pendingApprovals.map(v => (
                                <div key={v._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50">
                                  <div>
                                    <p className="font-bold text-sm text-[#0e2a4a]">{v.fullName}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Flat {v.block}-{v.flatNo} • {v.phone}</p>
                                  </div>
                                  <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => handleApproveVisitor(v._id, "APPROVE")} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">Allow</button>
                                    <button onClick={() => handleApproveVisitor(v._id, "REJECT")} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">Deny</button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center text-gray-400"><FaCheckCircle className="mx-auto text-3xl mb-2 opacity-20"/> <p className="text-sm font-medium">Log is all cleared</p></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Responsive Table Wrapper */}
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                          <h3 className="font-bold text-[#0e2a4a] flex items-center gap-2"><FaClipboardList/> Today's Activity Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                {["Visitor", "Flat", "Status", "Time", "Action"].map(h => (
                                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {securityStats?.todayVisitors?.slice(0, 8).map(v => (
                                <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                        {v.fullName.charAt(0)}
                                      </div>
                                      <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">{v.fullName}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-gray-500">{v.block}-{v.flatNo}</td>
                                  <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${StatusColors[v.status] || "bg-gray-100 text-gray-400"}`}>
                                      {v.status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-gray-400">{v.entryTime ? format(new Date(v.entryTime), "hh:mm a") : "—"}</td>
                                  <td className="px-6 py-4">
                                    <button onClick={() => setVisitorDetailModal(v)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FaEye/></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(!securityStats?.todayVisitors || securityStats.todayVisitors.length === 0) && (
                            <div className="p-12 text-center text-gray-400">No data logged today</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Tabs Rendering (All Visitors / Inside / Pending) */}
                  {activeTab !== "dashboard" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-1">
                          <select 
                            className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#ffb703]"
                            value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                          >
                            <option value="">Status: All</option>
                            <option value="PENDING">Pending</option>
                            <option value="CHECKED_IN">Inside</option>
                            <option value="CHECKED_OUT">Exited</option>
                          </select>
                          <input 
                            type="date" className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold"
                            value={dateFilter} onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}
                          />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <GoldBtn onClick={() => setAddVisitorModal(true)} className="flex-1 !py-2 !text-xs"><FaUserPlus/> Add</GoldBtn>
                          <button onClick={() => {setAddMode("qr"); setAddVisitorModal(true);}} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm"><FaQrcode/> Scan</button>
                        </div>
                      </div>

                      {/* Card-based List for Mobile/Tablet */}
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {paginate(filteredData).map((v, i) => (
                          <motion.div 
                            key={v._id} 
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                            whileHover={{ y: -2 }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                {v.photo?.url ? (
                                  <img src={v.photo.url} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">{v.fullName.charAt(0)}</div>
                                )}
                                <div>
                                  <h4 className="font-bold text-gray-800 text-sm">{v.fullName}</h4>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">{v.phone}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${StatusColors[v.status] || "bg-gray-100"}`}>
                                {v.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5 border-y border-gray-50 py-3">
                              <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Flat/Block</p>
                                <p className="text-xs font-black text-gray-700">{v.block} - {v.flatNo}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Approval</p>
                                <p className="text-xs font-black text-purple-600">{v.approvalMethod}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                              <button onClick={() => setVisitorDetailModal(v)} className="flex-1 py-2 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg uppercase hover:bg-gray-100">Details</button>
                              {v.status === "PENDING" && (
                                <>
                                  <button onClick={() => handleApproveVisitor(v._id, "APPROVE")} className="flex-1 py-2 bg-green-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-sm">Allow</button>
                                  <button onClick={() => handleApproveVisitor(v._id, "REJECT")} className="flex-1 py-2 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-sm">Deny</button>
                                </>
                              )}
                              {v.status === "CHECKED_IN" && (
                                <button onClick={() => handleMarkExit(v._id)} className="flex-1 py-2 bg-orange-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-sm">Mark Exit</button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {filteredData.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                          <FaSearch className="mx-auto text-4xl mb-4 opacity-10" />
                          <p className="font-bold">No matching records found</p>
                        </div>
                      )}

                      <PaginationControls total={filteredData.length} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      
      {/* Add Visitor Modal */}
      <Modal open={addVisitorModal} onClose={closeAddVisitorModal} title={addMode === "manual" ? "Add Visitor" : "QR Entry Scan"}>
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Toggle UI */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setAddMode("manual")} 
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${addMode === "manual" ? "bg-white shadow text-[#0e2a4a]" : "text-gray-400"}`}
          >Manual</button>
          <button 
            onClick={() => setAddMode("qr")} 
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${addMode === "qr" ? "bg-white shadow text-purple-600" : "text-gray-400"}`}
          >QR Scan</button>
        </div>

        {addMode === "manual" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Full Name *" placeholder="Enter name" value={addVisitorForm.fullName} onChange={(e) => setAddVisitorForm({...addVisitorForm, fullName: e.target.value})} />
              <InputField label="Phone Number *" placeholder="Enter 10-digit number" value={addVisitorForm.phone} onChange={(e) => setAddVisitorForm({...addVisitorForm, phone: e.target.value})} />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Resident to Visit *</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ffb703] outline-none"
                value={addVisitorForm.residentId} 
                onChange={(e) => {
                  const sel = residents.find(r => r._id === e.target.value);
                  setAddVisitorForm({...addVisitorForm, residentId: e.target.value, flatNo: sel?.flatNo || "", block: sel?.block || "", visitorFor: sel?.fullName || ""});
                }}
              >
                <option value="">Search & Select Resident</option>
                {residents.map(r => (
                  <option key={r._id} value={r._id}>{r.fullName} ({r.block}-{r.flatNo})</option>
                ))}
              </select>
            </div>

            <InputField label="Purpose of Visit" placeholder="e.g. Courier, Relative" value={addVisitorForm.purpose} onChange={(e) => setAddVisitorForm({...addVisitorForm, purpose: e.target.value})} />

            {/* Photo Capture Section */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identity Capture</p>
              {capturedPhoto ? (
                <div className="flex items-center gap-4">
                  <img src={capturedPhoto} className="w-20 h-20 rounded-xl object-cover border-2 border-[#ffb703]" />
                  <button onClick={retakePhoto} className="text-xs font-bold text-blue-600 flex items-center gap-1"><FaRedo/> Redo</button>
                </div>
              ) : cameraActive ? (
                <div className="space-y-3">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video rounded-xl object-cover bg-black" />
                  <GoldBtn onClick={capturePhoto} className="w-full"><FaCamera/> Click to Capture</GoldBtn>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={startCamera} className="flex-1 py-3 bg-[#0e2a4a] text-white text-xs font-bold rounded-xl uppercase tracking-widest"><FaVideo className="inline mr-2"/> Camera</button>
                  <label className="flex-1">
                    <div className="w-full py-3 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-xl uppercase tracking-widest flex items-center justify-center cursor-pointer"><FaUpload className="inline mr-2"/> Gallery</div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files[0]) { setUploadedFile(e.target.files[0]); setPhotoSource("upload"); setCapturedPhoto(URL.createObjectURL(e.target.files[0])); }}} />
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={closeAddVisitorModal} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-400 uppercase tracking-widest text-xs">Cancel</button>
              <GoldBtn onClick={handleAddVisitor} className="flex-[2]">Confirm Entry</GoldBtn>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <QRScanner onScanSuccess={(text) => setQrForm({...qrForm, qrToken: text})} onClose={() => {}} />
            <InputField label="Token Details" value={qrForm.qrToken} onChange={(e) => setQrForm({...qrForm, qrToken: e.target.value})} placeholder="Scan or manually enter token" />
            <div className="flex gap-3">
               <button onClick={closeAddVisitorModal} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-400 uppercase tracking-widest text-xs">Close</button>
               <button onClick={handleQRScan} className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-md">Verify QR Code</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Visitor Detail Modal */}
      <Modal open={!!visitorDetailModal} onClose={() => setVisitorDetailModal(null)} title="Security Record">
        {visitorDetailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl">
              {visitorDetailModal.photo?.url ? (
                <img src={visitorDetailModal.photo.url} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#ffb703] shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#0e2a4a] text-white flex items-center justify-center text-3xl font-black">{visitorDetailModal.fullName.charAt(0)}</div>
              )}
              <div>
                <h4 className="text-xl font-black text-[#0e2a4a]">{visitorDetailModal.fullName}</h4>
                <p className="text-sm text-gray-500 font-bold">{visitorDetailModal.phone}</p>
                <span className={`mt-2 inline-block text-[9px] px-2 py-0.5 rounded font-black uppercase ${StatusColors[visitorDetailModal.status]}`}>{visitorDetailModal.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { l: "Unit", v: `${visitorDetailModal.block}-${visitorDetailModal.flatNo}` },
                { l: "Host", v: visitorDetailModal.visitorFor },
                { l: "Reason", v: visitorDetailModal.purpose },
                { l: "Arrival", v: visitorDetailModal.entryTime ? format(new Date(visitorDetailModal.entryTime), "hh:mm a") : "Pending" }
              ].map(x => (
                <div key={x.l} className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{x.l}</p>
                  <p className="text-xs font-black text-gray-700">{x.v || "N/A"}</p>
                </div>
              ))}
            </div>

            {visitorDetailModal.vehicleDetails?.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Vehicle Info</p>
                {visitorDetailModal.vehicleDetails.map((vd, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <FaCar className="text-[#ffb703]" /> {vd.registrationNumber} ({vd.model} - {vd.color})
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {visitorDetailModal.status === "PENDING" && (
                <GreenBtn onClick={() => {handleApproveVisitor(visitorDetailModal._id, "APPROVE"); setVisitorDetailModal(null);}} className="w-full py-4">Authorize Entry</GreenBtn>
              )}
              {visitorDetailModal.status === "CHECKED_IN" && (
                <button onClick={() => {handleMarkExit(visitorDetailModal._id); setVisitorDetailModal(null);}} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg">Confirm Exit</button>
              )}
              <button onClick={() => setVisitorDetailModal(null)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Back</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityDashboard;
