// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { formatDistanceToNow, format } from "date-fns";
// import QRScanner from "../../components/QRScanner";
// import logo from "../../assets/logo5.png";
// import {
//   FaShieldAlt,
//   FaUsers,
//   FaClock,
//   FaSignOutAlt,
//   FaSearch,
//   FaPlus,
//   FaTrash,
//   FaCheck,
//   FaTimes,
//   FaBars,
//   FaSpinner,
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaQrcode,
//   FaUserPlus,
//   FaChevronLeft,
//   FaChevronRight,
//   FaDoorOpen,
//   FaDoorClosed,
//   FaFilter,
//   FaEye,
//   FaBell,
//   FaUserTie,
//   FaCalendarAlt,
//   FaPhoneAlt,
//   FaBuilding,
//   FaCar,
//   FaCamera,
//   FaClipboardList,
//   FaVideo,
//   FaRedo,
//   FaUpload,
//   FaToggleOn,
//   FaToggleOff,
// } from "react-icons/fa";
// import { MdPending, MdOutlineVerified } from "react-icons/md";
// import { Link } from "react-router-dom";

// const BASE = "http://localhost:8000";

// // ─── Color Maps ──────────────────────────────────────────────────────────────
// const StatusColors = {
//   PENDING: "bg-yellow-100 text-yellow-800",
//   APPROVED: "bg-blue-100 text-blue-800",
//   REJECTED: "bg-red-100 text-red-800",
//   CHECKED_IN: "bg-green-100 text-green-800",
//   CHECKED_OUT: "bg-gray-100 text-gray-800",
//   EXPIRED: "bg-orange-100 text-orange-800",
// };

// const MethodColors = {
//   QR: "bg-purple-100 text-purple-800",
//   MANUAL: "bg-blue-100 text-blue-800",
//   DIRECT: "bg-gray-100 text-gray-800",
// };

// // ─── Animation Variants ──────────────────────────────────────────────────────
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1, delayChildren: 0.2 },
//   },
// };
// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
// };

// // ─── Reusable Components ─────────────────────────────────────────────────────
// const DashboardCard = ({ title, value, icon, color, delay = 0, sub }) => (
//   <motion.div
//     className={`p-6 rounded-2xl shadow-lg bg-gradient-to-r ${color} text-white flex items-center justify-between relative overflow-hidden group cursor-pointer`}
//     whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
//     whileTap={{ scale: 0.95 }}
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.5 }}
//   >
//     <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//     <div className="relative z-10">
//       <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
//       <motion.h3
//         className="text-3xl font-bold"
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
//       >
//         {value}
//       </motion.h3>
//       {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
//     </div>
//     <motion.div
//       className="p-4 rounded-full bg-white/20 backdrop-blur-sm relative z-10"
//       whileHover={{ rotate: 360 }}
//       transition={{ duration: 0.6 }}
//     >
//       {icon}
//     </motion.div>
//   </motion.div>
// );

// const Modal = ({ open, onClose, title, children }) => (
//   <AnimatePresence>
//     {open && (
//       <motion.div
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//       >
//         <motion.div
//           className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
//           initial={{ scale: 0.9, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.9, opacity: 0, y: 20 }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-2xl font-bold text-[#0e2a4a]">{title}</h3>
//             <button onClick={onClose} className="mt-3">
//               Close
//             </button>
//           </div>
//           {children}
//         </motion.div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ label, ...props }) => (
//   <div>
//     {label && (
//       <label className="block text-sm font-semibold mb-2 text-gray-700">
//         {label}
//       </label>
//     )}
//     <input
//       className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all"
//       {...props}
//     />
//   </div>
// );

// const SelectField = ({ label, options, ...props }) => (
//   <div>
//     {label && (
//       <label className="block text-sm font-semibold mb-2 text-gray-700">
//         {label}
//       </label>
//     )}
//     <select
//       className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all"
//       {...props}
//     >
//       {options.map((o) => (
//         <option key={o.value} value={o.value}>
//           {o.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const GoldBtn = ({ children, className = "", ...props }) => (
//   <motion.button
//     className={`px-6 py-3 bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] rounded-xl font-semibold hover:shadow-lg transition-all duration-300 ${className}`}
//     whileHover={{ scale: 1.02 }}
//     whileTap={{ scale: 0.98 }}
//     {...props}
//   >
//     {children}
//   </motion.button>
// );

// const RedBtn = ({ children, className = "", ...props }) => (
//   <motion.button
//     className={`px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 text-sm transition-all duration-300 ${className}`}
//     whileHover={{ scale: 1.05 }}
//     whileTap={{ scale: 0.95 }}
//     {...props}
//   >
//     {children}
//   </motion.button>
// );

// const GreenBtn = ({ children, className = "", ...props }) => (
//   <motion.button
//     className={`px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 text-sm transition-all duration-300 ${className}`}
//     whileHover={{ scale: 1.05 }}
//     whileTap={{ scale: 0.95 }}
//     {...props}
//   >
//     {children}
//   </motion.button>
// );

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// const SecurityDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // Data
//   const [securityStats, setSecurityStats] = useState(null);
//   const [visitors, setVisitors] = useState([]);
//   const [residents, setResidents] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const ITEMS_PER_PAGE = 8;

//   // Modals
//   const [addVisitorModal, setAddVisitorModal] = useState(false);
//   const [visitorDetailModal, setVisitorDetailModal] = useState(null);

//   // Forms
//   const [addVisitorForm, setAddVisitorForm] = useState({
//     fullName: "",
//     phone: "",
//     visitorFor: "",
//     purpose: "General Visit",
//     flatNo: "",
//     block: "",
//     residentId: "",
//     vehicleType: "",
//     vehicleModel: "",
//     vehicleColor: "",
//     vehicleReg: "",
//   });
//   const [qrForm, setQrForm] = useState({
//     qrToken: "",
//     fullName: "",
//     phone: "",
//     purpose: "General Visit",
//   });

//   // Camera / photo state
//   const [addMode, setAddMode] = useState("manual"); // "manual" | "qr"
//   const [cameraActive, setCameraActive] = useState(false);
//   const [capturedPhoto, setCapturedPhoto] = useState(null); // base64 preview
//   const [capturedBlob, setCapturedBlob] = useState(null); // actual File/Blob for upload
//   const [uploadedFile, setUploadedFile] = useState(null); // from file input
//   const [photoSource, setPhotoSource] = useState("none"); // "camera" | "upload" | "none"
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   // Mouse parallax
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth) * 2 - 1,
//         y: (e.clientY / window.innerHeight) * 2 - 1,
//       });
//     };
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, []);
//   useEffect(() => {
//     fetchResidents();
//   }, []);

//   // ─── API ─────────────────────────────────────────────────────────────────────
//   const api = useCallback(async (method, url, data = null) => {
//     const config = { withCredentials: true };
//     if (method === "get") return axios.get(`${BASE}${url}`, config);
//     if (method === "post") return axios.post(`${BASE}${url}`, data, config);
//     if (method === "patch") return axios.patch(`${BASE}${url}`, data, config);
//     if (method === "delete") return axios.delete(`${BASE}${url}`, config);
//   }, []);

//   const fetchSecurityStats = async () => {
//     try {
//       const r = await api("get", "/analytics/security");
//       if (r.data.success) setSecurityStats(r.data.data);
//     } catch (err) {
//       console.error("Stats error:", err);
//     }
//   };

//   const fetchVisitors = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (statusFilter) params.append("status", statusFilter);
//       if (dateFilter) params.append("date", dateFilter);
//       const r = await api("get", `/guard/visitor?${params.toString()}`);
//       if (r.data.success) setVisitors(r.data.visitors || []);
//     } catch (err) {
//       console.error("Visitors error:", err);
//       setVisitors([]);
//     }
//   };

//   const fetchResidents = async () => {
//     try {
//       const r = await api("get", "/resident/all");

//       console.log("Residents:", r.data);

//       if (Array.isArray(r.data)) {
//         setResidents(r.data);
//       } else if (r.data?.residents) {
//         setResidents(r.data.residents);
//       } else {
//         setResidents([]);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Tab loader
//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setCurrentPage(1);
//       try {
//         switch (activeTab) {
//           case "dashboard":
//             await fetchSecurityStats();
//             break;
//           case "visitors":
//             await fetchVisitors();
//             await fetchResidents();
//             break;
//           case "inside":
//             await fetchVisitors();
//             break;
//           case "pending":
//             await fetchVisitors();
//             break;
//         }
//       } catch (err) {
//         toast.error("Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [activeTab]);

//   useEffect(() => {
//     if (activeTab === "visitors") fetchVisitors();
//   }, [statusFilter, dateFilter]);

//   // ─── Handlers ────────────────────────────────────────────────────────────────
//   const handleLogout = async () => {
//     try {
//       await api("post", "/user/guard/logout");
//       localStorage.removeItem("guard");
//       toast.success("Logged out");
//       navigate("/");
//     } catch {
//       toast.error("Logout failed");
//     }
//   };

//   // ─── Camera helpers ──────────────────────────────────────────────────────────
//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//       });

//       streamRef.current = stream;

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play(); // ✅ IMPORTANT
//       }

//       setCameraActive(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Camera access denied");
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     setCameraActive(false);
//   };

//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext("2d").drawImage(video, 0, 0);
//     const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
//     setCapturedPhoto(dataUrl);
//     // Convert base64 to Blob
//     fetch(dataUrl)
//       .then((r) => r.blob())
//       .then((blob) => {
//         setCapturedBlob(
//           new File([blob], "visitor_capture.jpg", { type: "image/jpeg" }),
//         );
//       });
//     stopCamera();
//     setPhotoSource("camera");
//   };

//   const retakePhoto = () => {
//     setCapturedPhoto(null);
//     setCapturedBlob(null);
//     setPhotoSource("none");
//     startCamera();
//   };

//   const clearPhoto = () => {
//     setCapturedPhoto(null);
//     setCapturedBlob(null);
//     setUploadedFile(null);
//     setPhotoSource("none");
//     stopCamera();
//   };

//   // Cleanup camera on modal close
//   const closeAddVisitorModal = () => {
//     stopCamera();
//     clearPhoto();
//     setAddVisitorModal(false);
//     setAddMode("manual");
//   };

//   const handleAddVisitor = async () => {
//     try {
//       // Determine which photo to use
//       const photoFile =
//         photoSource === "camera"
//           ? capturedBlob
//           : photoSource === "upload"
//             ? uploadedFile
//             : null;

//       const formData = new FormData();
//       formData.append("fullName", addVisitorForm.fullName);
//       formData.append("phone", addVisitorForm.phone);
//       formData.append("visitorFor", addVisitorForm.visitorFor);
//       formData.append("purpose", addVisitorForm.purpose);
//       formData.append("residentId", addVisitorForm.residentId);

//       // Auto-fill flatNo/block from selected resident if not manually set
//       let flatNo = addVisitorForm.flatNo;
//       let block = addVisitorForm.block;
//       if (!flatNo || !block) {
//         const sel = residents.find((r) => r._id === addVisitorForm.residentId);
//         if (sel) {
//           flatNo = sel.flatNo;
//           block = sel.block;
//         }
//       }
//       formData.append("flatNo", flatNo);
//       formData.append("block", block);

//       if (addVisitorForm.vehicleType) {
//         formData.append(
//           "vehicleDetails",
//           JSON.stringify([
//             {
//               type: addVisitorForm.vehicleType,
//               model: addVisitorForm.vehicleModel,
//               color: addVisitorForm.vehicleColor,
//               registrationNumber: addVisitorForm.vehicleReg,
//             },
//           ]),
//         );
//       }

//       if (photoFile) formData.append("photo", photoFile);

//       const r = await axios.post(`${BASE}/guard/visitor/add`, formData, {
//         withCredentials: true,
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (r.data.success) {
//         toast.success(
//           photoFile
//             ? "Visitor added with photo & resident notified"
//             : "Visitor added & resident notified",
//         );
//         closeAddVisitorModal();
//         setAddVisitorForm({
//           fullName: "",
//           phone: "",
//           visitorFor: "",
//           purpose: "General Visit",
//           flatNo: "",
//           block: "",
//           residentId: "",
//           vehicleType: "",
//           vehicleModel: "",
//           vehicleColor: "",
//           vehicleReg: "",
//         });
//         fetchVisitors();
//         fetchSecurityStats();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to add visitor");
//     }
//   };

//   const handleQRScan = async () => {
//     try {
//       if (!qrForm.qrToken) {
//         toast.error("QR token is required");
//         return;
//       }

//       const photoFile =
//         photoSource === "camera"
//           ? capturedBlob
//           : photoSource === "upload"
//             ? uploadedFile
//             : null;

//       let data;

//       // ✅ IF PHOTO EXISTS → use FormData
//       if (photoFile) {
//         const formData = new FormData();
//         formData.append("qrToken", qrForm.qrToken);
//         formData.append("fullName", qrForm.fullName);
//         formData.append("phone", qrForm.phone);
//         formData.append("purpose", qrForm.purpose);
//         formData.append("photo", photoFile);

//         data = await axios.post(`${BASE}/qr/scan`, formData, {
//           withCredentials: true,
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       // ✅ NO PHOTO → use JSON (VERY IMPORTANT)
//       else {
//         data = await axios.post(
//           `${BASE}/qrscan`,
//           {
//             qrToken: qrForm.qrToken,
//             fullName: qrForm.fullName,
//             phone: qrForm.phone,
//             purpose: qrForm.purpose,
//           },
//           { withCredentials: true },
//         );
//       }

//       if (data.data.success) {
//         toast.success(
//           `✅ ${data.data.data?.fullName || "Visitor"} checked in via QR`,
//         );

//         setQrScanModal(false);
//         clearPhoto();
//         setQrForm({
//           qrToken: "",
//           fullName: "",
//           phone: "",
//           purpose: "General Visit",
//         });

//         fetchVisitors();
//         fetchSecurityStats();
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "QR scan failed");
//     }
//   };

//   const handleApproveVisitor = async (visitorId, action) => {
//     try {
//       const r = await api("patch", `/guard/visitor/approve/${visitorId}`, {
//         action,
//       });
//       if (r.data.success) {
//         toast.success(`Visitor ${action.toLowerCase()}d`);
//         fetchVisitors();
//         fetchSecurityStats();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Action failed");
//     }
//   };

//   const handleMarkExit = async (visitorId) => {
//     if (!window.confirm("Mark this visitor as exited?")) return;
//     try {
//       const r = await api("patch", `/guard/visitor/exit/${visitorId}`);
//       if (r.data.success) {
//         toast.success("Exit recorded");
//         fetchVisitors();
//         fetchSecurityStats();
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed");
//     }
//   };

//   const formatDate = (d) => {
//     if (!d) return "—";
//     const dt = new Date(d);
//     return isNaN(dt) ? "—" : format(dt, "dd MMM yyyy, hh:mm a");
//   };

//   // ─── Filtering & Pagination ──────────────────────────────────────────────────
//   const search = (arr, keys) =>
//     arr.filter((item) =>
//       keys.some((k) =>
//         String(item[k] || "")
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()),
//       ),
//     );

//   const paginate = (data) => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return data.slice(start, start + ITEMS_PER_PAGE);
//   };

//   const PaginationControls = ({ total }) => {
//     const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
//     if (totalPages <= 1) return null;
//     return (
//       <motion.div
//         className="flex justify-between items-center mt-6 px-4"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//       >
//         <motion.button
//           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           disabled={currentPage === 1}
//           className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
//           whileHover={currentPage !== 1 ? { scale: 1.02 } : {}}
//           whileTap={currentPage !== 1 ? { scale: 0.98 } : {}}
//         >
//           <FaChevronLeft className="text-sm" /> Previous
//         </motion.button>
//         <div className="flex items-center gap-2">
//           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
//             (p) => (
//               <motion.button
//                 key={p}
//                 onClick={() => setCurrentPage(p)}
//                 className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${currentPage === p ? "bg-[#0e2a4a] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md"}`}
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//               >
//                 {p}
//               </motion.button>
//             ),
//           )}
//         </div>
//         <motion.button
//           onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//           disabled={currentPage === totalPages}
//           className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#ffb703] text-[#0e2a4a] hover:bg-[#ffa502] hover:shadow-lg"}`}
//           whileHover={currentPage !== totalPages ? { scale: 1.02 } : {}}
//           whileTap={currentPage !== totalPages ? { scale: 0.98 } : {}}
//         >
//           Next <FaChevronRight className="text-sm" />
//         </motion.button>
//       </motion.div>
//     );
//   };

//   // Sidebar items
//   const sidebarItems = [
//     { key: "dashboard", icon: FaShieldAlt, label: "Dashboard" },
//     { key: "visitors", icon: FaUsers, label: "All Visitors" },
//     { key: "inside", icon: FaDoorOpen, label: "Currently Inside" },
//     { key: "pending", icon: MdPending, label: "Pending Approvals" },
//   ];

//   const guardUser = JSON.parse(localStorage.getItem("guard") || "{}");

//   // Derived data for tabs
//   const insideVisitors = visitors.filter((v) => v.status === "CHECKED_IN");
//   const pendingVisitors = visitors.filter((v) => v.status === "PENDING");

//   const getTabData = () => {
//     if (activeTab === "inside") return insideVisitors;
//     if (activeTab === "pending") return pendingVisitors;
//     return visitors;
//   };

//   const filteredData = search(getTabData(), [
//     "fullName",
//     "phone",
//     "flatNo",
//     "block",
//     "visitorFor",
//     "purpose",
//     "status",
//   ]);

//   // ─── Render ──────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       <ToastContainer position="top-right" theme="light" autoClose={3000} />

//       {/* Floating BG elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#0e2a4a]/10 to-[#ffb703]/10 rounded-full blur-3xl"
//           animate={{ x: mousePosition.x * 20, y: mousePosition.y * 20 }}
//           transition={{ type: "spring", stiffness: 50, damping: 20 }}
//         />
//         <motion.div
//           className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#ffb703]/10 to-[#0e2a4a]/10 rounded-full blur-3xl"
//           animate={{ x: mousePosition.x * -15, y: mousePosition.y * -15 }}
//           transition={{ type: "spring", stiffness: 50, damping: 20 }}
//         />
//       </div>

//       {/* Navbar */}
//       <motion.nav
//         className="bg-[#0e2a4a] text-white shadow-2xl relative z-50 backdrop-blur-xl border-b border-white/20"
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//       >
//         <div className="max-w-8xl px-8 py-3 flex justify-between items-center">
//           <motion.div
//             className="flex items-center gap-4"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.2 }}
//           >
//             <Link to="/" className="flex items-center gap-3">
//               <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md bg-[#ffb703]/20 flex items-center justify-center">
//                 <img
//                   src={logo}
//                   alt="UrbanNest"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <motion.span
//                 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 UrbanNest
//               </motion.span>
//               <span className="hidden md:block px-3 py-1 bg-[#ffb703]/20 text-[#ffb703] rounded-full text-xs font-bold uppercase tracking-widest border border-[#ffb703]/30">
//                 Security
//               </span>
//             </Link>
//           </motion.div>

//           <div className="hidden md:flex items-center gap-6">
//             {/* Quick Action Buttons in Navbar */}
//             <motion.button
//               onClick={() => setAddVisitorModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-[#ffb703]/20 hover:bg-[#ffb703]/30 border border-[#ffb703]/40 text-[#ffb703] rounded-xl transition-all duration-300"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <FaUserPlus className="text-sm" /> Add Visitor
//             </motion.button>
//             <motion.button
//               onClick={() => {
//                 setAddMode("qr");
//                 setAddVisitorModal(true);
//               }}
//               className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 rounded-xl transition-all duration-300"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <FaQrcode className="text-sm" /> Scan QR
//             </motion.button>
//             <motion.button
//               onClick={handleLogout}
//               className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-300 hover:shadow-lg"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <FaSignOutAlt className="mr-2" /> Logout
//             </motion.button>
//           </div>

//           <div className="md:hidden">
//             <motion.button
//               onClick={() => setMobileOpen(!mobileOpen)}
//               whileTap={{ scale: 0.9 }}
//             >
//               <AnimatePresence mode="wait">
//                 {mobileOpen ? (
//                   <motion.div
//                     key="close"
//                     initial={{ rotate: -90, opacity: 0 }}
//                     animate={{ rotate: 0, opacity: 1 }}
//                     exit={{ rotate: 90, opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <FaTimes className="h-6 w-6 text-white" />
//                   </motion.div>
//                 ) : (
//                   <motion.div
//                     key="menu"
//                     initial={{ rotate: 90, opacity: 0 }}
//                     animate={{ rotate: 0, opacity: 1 }}
//                     exit={{ rotate: -90, opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <FaBars className="h-6 w-6 text-white" />
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.button>
//           </div>
//         </div>

//         <AnimatePresence>
//           {mobileOpen && (
//             <motion.div
//               className="md:hidden bg-[#0e2a4a] px-6 pb-4 space-y-3 border-t border-[#1a4b7a]"
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <motion.button
//                 onClick={handleLogout}
//                 className="flex items-center w-full p-2 bg-red-600 hover:bg-red-700 rounded-lg"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <FaSignOutAlt className="mr-2" /> Logout
//               </motion.button>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.nav>

//       {/* Main */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar */}
//         <motion.div
//           className="w-64 h-full overflow-y-auto bg-white/80 backdrop-blur-xl text-[#0e2a4a] shadow-2xl border-r border-white/20 relative z-10"
//           initial={{ x: -300 }}
//           animate={{ x: 0 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//         >
//           <div className="p-6 border-b border-gray-200/50">
//             <motion.h1
//               className="text-xl font-bold flex items-center text-[#0e2a4a]"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <FaShieldAlt className="mr-3 text-[#ffb703]" /> Guard Portal
//             </motion.h1>
//             <motion.p
//               className="text-sm text-gray-600 mt-1"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               {guardUser?.fullName?.split(" ")[0] || "Guard"} — Security
//             </motion.p>
//           </div>

//           {/* Live status indicator */}
//           <div className="px-6 py-3 border-b border-gray-200/50">
//             <div className="flex items-center gap-2">
//               <span className="relative flex h-3 w-3">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
//               </span>
//               <span className="text-xs font-semibold text-green-600">
//                 On Duty
//               </span>
//               <span className="ml-auto text-xs text-gray-400">
//                 {format(new Date(), "hh:mm a")}
//               </span>
//             </div>
//           </div>

//           <nav className="p-4">
//             <motion.ul
//               className="space-y-2"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               {sidebarItems.map((item) => (
//                 <motion.li key={item.key} variants={itemVariants}>
//                   <motion.button
//                     onClick={() => {
//                       setActiveTab(item.key);
//                       setMobileOpen(false);
//                       setSearchTerm("");
//                       setCurrentPage(1);
//                     }}
//                     className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 font-medium ${activeTab === item.key ? "bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] shadow-lg" : "hover:bg-white/50 hover:shadow-md text-gray-700"}`}
//                     whileHover={{ scale: 1.02, x: 4 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <item.icon className="mr-3 text-lg" />
//                     {item.label}
//                     {item.key === "pending" && pendingVisitors.length > 0 && (
//                       <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
//                         {pendingVisitors.length}
//                       </span>
//                     )}
//                     {item.key === "inside" && insideVisitors.length > 0 && (
//                       <span className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
//                         {insideVisitors.length}
//                       </span>
//                     )}
//                   </motion.button>
//                 </motion.li>
//               ))}
//             </motion.ul>

//             {/* Quick Actions in Sidebar */}
//             <div className="mt-6 space-y-2">
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">
//                 Quick Actions
//               </p>
//               <motion.button
//                 onClick={() => setAddVisitorModal(true)}
//                 className="w-full flex items-center p-3 rounded-xl bg-[#ffb703]/10 hover:bg-[#ffb703]/20 text-[#0e2a4a] transition-all font-medium border border-[#ffb703]/20"
//                 whileHover={{ scale: 1.02, x: 4 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <FaUserPlus className="mr-3 text-[#ffb703]" /> Add Visitor
//               </motion.button>
//               <motion.button
//                 onClick={() => {
//                   setAddMode("qr");
//                   setAddVisitorModal(true);
//                 }}
//                 className="w-full flex items-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all font-medium border border-purple-200"
//                 whileHover={{ scale: 1.02, x: 4 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <FaQrcode className="mr-3 text-purple-500" /> Scan QR
//               </motion.button>
//             </div>
//           </nav>
//         </motion.div>

//         {/* Content */}
//         <div className="flex-1 overflow-auto relative z-10">
//           {/* Header */}
//           <motion.header
//             className="bg-white/80 backdrop-blur-xl shadow-sm p-6 border-b border-gray-200/50"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             <div className="flex justify-between items-center">
//               <motion.h2
//                 className="text-2xl font-bold capitalize text-[#0e2a4a]"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 {sidebarItems.find((s) => s.key === activeTab)?.label ||
//                   "Dashboard"}
//               </motion.h2>
//               {activeTab !== "dashboard" && (
//                 <motion.div
//                   className="relative w-80"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.4 }}
//                 >
//                   <input
//                     type="text"
//                     placeholder="Search visitors..."
//                     className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] focus:border-transparent transition-all duration-300 shadow-sm"
//                     value={searchTerm}
//                     onChange={(e) => {
//                       setSearchTerm(e.target.value);
//                       setCurrentPage(1);
//                     }}
//                   />
//                   <FaSearch className="absolute left-4 top-4 text-gray-400" />
//                 </motion.div>
//               )}
//             </div>
//           </motion.header>

//           {/* Main content */}
//           <main className="p-6">
//             <AnimatePresence mode="wait">
//               {loading ? (
//                 <motion.div
//                   key="loading"
//                   className="flex justify-center items-center h-64"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <motion.div
//                     className="flex flex-col items-center gap-4"
//                     animate={{ y: [0, -10, 0] }}
//                     transition={{ repeat: Infinity, duration: 1.5 }}
//                   >
//                     <div className="w-16 h-16 border-4 border-[#ffb703]/30 border-t-[#ffb703] rounded-full animate-spin" />
//                     <p className="text-gray-600 font-medium">Loading...</p>
//                   </motion.div>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   key={activeTab}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.4 }}
//                 >
//                   {/* ─── DASHBOARD ─────────────────────────────────────── */}
//                   {activeTab === "dashboard" && (
//                     <>
//                       <motion.div
//                         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
//                         variants={containerVariants}
//                         initial="hidden"
//                         animate="visible"
//                       >
//                         <DashboardCard
//                           title="Today's Visitors"
//                           value={securityStats?.counts?.todayTotal ?? "—"}
//                           icon={<FaUsers className="text-2xl" />}
//                           color="from-blue-500 to-blue-600"
//                           delay={0}
//                           sub="Total check-ins today"
//                         />
//                         <DashboardCard
//                           title="Currently Inside"
//                           value={securityStats?.counts?.insideCount ?? "—"}
//                           icon={<FaDoorOpen className="text-2xl" />}
//                           color="from-green-500 to-green-600"
//                           delay={0.1}
//                           sub="Active visitors"
//                         />
//                         <DashboardCard
//                           title="Pending Approvals"
//                           value={securityStats?.counts?.pendingCount ?? "—"}
//                           icon={<FaClock className="text-2xl" />}
//                           color="from-orange-500 to-orange-600"
//                           delay={0.2}
//                           sub="Awaiting action"
//                         />
//                         <DashboardCard
//                           title="Gate Status"
//                           value="Active"
//                           icon={<FaShieldAlt className="text-2xl" />}
//                           color="from-[#0e2a4a] to-[#1a4b7a]"
//                           delay={0.3}
//                           sub="All systems normal"
//                         />
//                       </motion.div>

//                       <div className="grid lg:grid-cols-2 gap-6 mb-6">
//                         {/* Currently Inside */}
//                         <motion.div
//                           className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.4 }}
//                         >
//                           <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-green-600 to-green-700">
//                             <h3 className="font-bold text-xl text-white flex items-center gap-2">
//                               <FaDoorOpen /> Currently Inside (
//                               {securityStats?.counts?.insideCount ?? 0})
//                             </h3>
//                           </div>
//                           <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//                             {!securityStats?.currentlyInside ||
//                             securityStats.currentlyInside.length === 0 ? (
//                               <div className="p-8 text-center text-gray-400">
//                                 <FaDoorClosed className="text-4xl mx-auto mb-2 opacity-50" />
//                                 <p className="text-sm">No visitors inside</p>
//                               </div>
//                             ) : (
//                               securityStats.currentlyInside.map((v) => (
//                                 <motion.div
//                                   key={v._id}
//                                   className="p-4 hover:bg-gray-50/50 transition-all"
//                                   initial={{ opacity: 0, x: -10 }}
//                                   animate={{ opacity: 1, x: 0 }}
//                                 >
//                                   <div className="flex justify-between items-start">
//                                     <div>
//                                       <p className="font-semibold text-[#0e2a4a]">
//                                         {v.fullName}
//                                       </p>
//                                       <p className="text-xs text-gray-500">
//                                         {v.block}-{v.flatNo} ·{" "}
//                                         {v.purpose || "General Visit"}
//                                       </p>
//                                       {v.resident && (
//                                         <p className="text-xs text-blue-600 mt-0.5">
//                                           Visiting: {v.resident.fullName}
//                                         </p>
//                                       )}
//                                     </div>
//                                     <div className="text-right">
//                                       <p className="text-xs text-gray-400">
//                                         {v.entryTime
//                                           ? formatDistanceToNow(
//                                               new Date(v.entryTime),
//                                               { addSuffix: true },
//                                             )
//                                           : "—"}
//                                       </p>
//                                       <span
//                                         className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${MethodColors[v.approvalMethod] || "bg-gray-100 text-gray-800"}`}
//                                       >
//                                         {v.approvalMethod}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 </motion.div>
//                               ))
//                             )}
//                           </div>
//                         </motion.div>

//                         {/* Pending Approvals */}
//                         <motion.div
//                           className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.5 }}
//                         >
//                           <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-500 to-orange-600">
//                             <h3 className="font-bold text-xl text-white flex items-center gap-2">
//                               <FaClock /> Pending Approvals (
//                               {securityStats?.counts?.pendingCount ?? 0})
//                             </h3>
//                           </div>
//                           <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//                             {!securityStats?.pendingApprovals ||
//                             securityStats.pendingApprovals.length === 0 ? (
//                               <div className="p-8 text-center text-gray-400">
//                                 <FaCheckCircle className="text-4xl mx-auto mb-2 opacity-50" />
//                                 <p className="text-sm">No pending approvals</p>
//                               </div>
//                             ) : (
//                               securityStats.pendingApprovals.map((v) => (
//                                 <motion.div
//                                   key={v._id}
//                                   className="p-4 hover:bg-gray-50/50 transition-all"
//                                   initial={{ opacity: 0, x: -10 }}
//                                   animate={{ opacity: 1, x: 0 }}
//                                 >
//                                   <div className="flex justify-between items-start">
//                                     <div className="flex-1">
//                                       <p className="font-semibold text-[#0e2a4a]">
//                                         {v.fullName}
//                                       </p>
//                                       <p className="text-xs text-gray-500">
//                                         {v.block}-{v.flatNo} ·{" "}
//                                         {v.purpose || "General Visit"}
//                                       </p>
//                                       <p className="text-xs text-gray-400 mt-0.5">
//                                         {formatDistanceToNow(
//                                           new Date(v.createdAt),
//                                           { addSuffix: true },
//                                         )}
//                                       </p>
//                                     </div>
//                                     <div className="flex gap-1 ml-2">
//                                       <GreenBtn
//                                         className="!px-2 !py-1 text-xs"
//                                         onClick={() =>
//                                           handleApproveVisitor(v._id, "APPROVE")
//                                         }
//                                       >
//                                         <FaCheck /> OK
//                                       </GreenBtn>
//                                       <RedBtn
//                                         className="!px-2 !py-1 text-xs"
//                                         onClick={() =>
//                                           handleApproveVisitor(v._id, "REJECT")
//                                         }
//                                       >
//                                         <FaTimes />
//                                       </RedBtn>
//                                     </div>
//                                   </div>
//                                 </motion.div>
//                               ))
//                             )}
//                           </div>
//                         </motion.div>
//                       </div>

//                       {/* Recent Visitors */}
//                       <motion.div
//                         className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20"
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.6 }}
//                       >
//                         <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-[#0e2a4a] to-[#1a4b7a]">
//                           <h3 className="font-bold text-xl text-white flex items-center gap-2">
//                             <FaClipboardList /> Today's Visitor Log
//                           </h3>
//                         </div>
//                         <div className="overflow-x-auto">
//                           {!securityStats?.todayVisitors ||
//                           securityStats.todayVisitors.length === 0 ? (
//                             <div className="p-12 text-center text-gray-400">
//                               <FaUsers className="text-5xl mx-auto mb-3 opacity-30" />
//                               <p>No visitors today</p>
//                             </div>
//                           ) : (
//                             <table className="min-w-full">
//                               <thead className="bg-gray-50/80">
//                                 <tr>
//                                   {[
//                                     "Name",
//                                     "Phone",
//                                     "Flat",
//                                     "Purpose",
//                                     "Method",
//                                     "Status",
//                                     "Entry Time",
//                                   ].map((h, i) => (
//                                     <motion.th
//                                       key={i}
//                                       className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
//                                       initial={{ opacity: 0, y: -10 }}
//                                       animate={{ opacity: 1, y: 0 }}
//                                       transition={{ delay: i * 0.05 }}
//                                     >
//                                       {h}
//                                     </motion.th>
//                                   ))}
//                                 </tr>
//                               </thead>
//                               <tbody className="divide-y divide-gray-200/50">
//                                 {securityStats.todayVisitors
//                                   .slice(0, 10)
//                                   .map((v, ri) => (
//                                     <motion.tr
//                                       key={v._id}
//                                       className="hover:bg-gray-50/50 transition-all duration-200"
//                                       initial={{ opacity: 0, x: -20 }}
//                                       animate={{ opacity: 1, x: 0 }}
//                                       transition={{ delay: ri * 0.04 }}
//                                       whileHover={{ scale: 1.005 }}
//                                     >
//                                       <td className="px-6 py-4 text-sm font-semibold text-[#0e2a4a]">
//                                         {v.fullName}
//                                       </td>
//                                       <td className="px-6 py-4 text-sm text-gray-600">
//                                         {v.phone}
//                                       </td>
//                                       <td className="px-6 py-4 text-sm text-gray-600">
//                                         {v.block}-{v.flatNo}
//                                       </td>
//                                       <td className="px-6 py-4 text-sm text-gray-600">
//                                         {v.purpose || "—"}
//                                       </td>
//                                       <td className="px-6 py-4 text-sm">
//                                         <span
//                                           className={`px-2 py-1 text-xs rounded-full ${MethodColors[v.approvalMethod] || "bg-gray-100 text-gray-800"}`}
//                                         >
//                                           {v.approvalMethod}
//                                         </span>
//                                       </td>
//                                       <td className="px-6 py-4 text-sm">
//                                         <span
//                                           className={`px-2 py-1 text-xs rounded-full ${StatusColors[v.status] || "bg-gray-100 text-gray-800"}`}
//                                         >
//                                           {v.status}
//                                         </span>
//                                       </td>
//                                       <td className="px-6 py-4 text-sm text-gray-500">
//                                         {v.entryTime
//                                           ? format(
//                                               new Date(v.entryTime),
//                                               "hh:mm a",
//                                             )
//                                           : "—"}
//                                       </td>
//                                     </motion.tr>
//                                   ))}
//                               </tbody>
//                             </table>
//                           )}
//                         </div>
//                       </motion.div>
//                     </>
//                   )}

//                   {/* ─── ALL VISITORS / INSIDE / PENDING ───────────────── */}
//                   {(activeTab === "visitors" ||
//                     activeTab === "inside" ||
//                     activeTab === "pending") && (
//                     <div>
//                       <motion.div
//                         className="flex flex-wrap justify-between items-center mb-6 gap-3"
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                       >
//                         <h3 className="text-xl font-bold text-[#0e2a4a]">
//                           {activeTab === "visitors" &&
//                             `All Visitors (${filteredData.length})`}
//                           {activeTab === "inside" &&
//                             `Currently Inside (${filteredData.length})`}
//                           {activeTab === "pending" &&
//                             `Pending Approvals (${filteredData.length})`}
//                         </h3>
//                         <div className="flex gap-3">
//                           <GoldBtn onClick={() => setAddVisitorModal(true)}>
//                             <FaUserPlus className="inline mr-2 text-sm" /> Add
//                             Visitor
//                           </GoldBtn>
//                           <motion.button
//                             onClick={() => {
//                               setAddMode("qr");
//                               setAddVisitorModal(true);
//                             }}
//                             className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                           >
//                             <FaQrcode className="inline mr-2 text-sm" /> Scan QR
//                           </motion.button>
//                         </div>
//                       </motion.div>

//                       {/* Filter row — only on "visitors" tab */}
//                       {activeTab === "visitors" && (
//                         <motion.div
//                           className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap gap-4 border border-white/20"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                         >
//                           <FaFilter className="text-gray-400 self-center" />
//                           <select
//                             value={statusFilter}
//                             onChange={(e) => {
//                               setStatusFilter(e.target.value);
//                               setCurrentPage(1);
//                             }}
//                             className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb703]"
//                           >
//                             <option value="">All Statuses</option>
//                             <option value="PENDING">Pending</option>
//                             <option value="CHECKED_IN">Checked In</option>
//                             <option value="CHECKED_OUT">Checked Out</option>
//                             <option value="REJECTED">Rejected</option>
//                             <option value="EXPIRED">Expired</option>
//                           </select>
//                           <input
//                             type="date"
//                             value={dateFilter}
//                             onChange={(e) => {
//                               setDateFilter(e.target.value);
//                               setCurrentPage(1);
//                             }}
//                             className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb703]"
//                           />
//                           <button
//                             onClick={() => {
//                               setStatusFilter("");
//                               setDateFilter("");
//                             }}
//                             className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
//                           >
//                             Clear
//                           </button>
//                         </motion.div>
//                       )}

//                       {/* Visitor cards */}
//                       {filteredData.length === 0 ? (
//                         <motion.div
//                           className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 text-center"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                         >
//                           <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
//                           <p className="text-gray-500">
//                             {activeTab === "pending"
//                               ? "No pending approvals"
//                               : activeTab === "inside"
//                                 ? "No visitors inside"
//                                 : "No visitors found"}
//                           </p>
//                         </motion.div>
//                       ) : (
//                         <div className="space-y-4">
//                           {paginate(filteredData).map((v, index) => (
//                             <motion.div
//                               key={v._id}
//                               className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20"
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               transition={{ delay: index * 0.04 }}
//                               whileHover={{
//                                 scale: 1.005,
//                                 transition: { duration: 0.2 },
//                               }}
//                             >
//                               <div className="flex items-start justify-between gap-4">
//                                 <div className="flex gap-4 flex-1 min-w-0">
//                                   {/* Photo or Avatar */}
//                                   <div className="shrink-0">
//                                     {v.photo?.url ? (
//                                       <img
//                                         src={v.photo.url}
//                                         alt={v.fullName}
//                                         className="w-14 h-14 rounded-full object-cover border-2 border-[#ffb703]"
//                                       />
//                                     ) : (
//                                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0e2a4a] to-[#1a4b7a] flex items-center justify-center text-white font-bold text-lg">
//                                         {v.fullName?.charAt(0)?.toUpperCase()}
//                                       </div>
//                                     )}
//                                   </div>

//                                   <div className="flex-1 min-w-0">
//                                     {/* Badges */}
//                                     <div className="flex flex-wrap items-center gap-2 mb-2">
//                                       <span
//                                         className={`px-2 py-0.5 text-xs rounded-full font-semibold ${StatusColors[v.status] || "bg-gray-100 text-gray-800"}`}
//                                       >
//                                         {v.status}
//                                       </span>
//                                       <span
//                                         className={`px-2 py-0.5 text-xs rounded-full ${MethodColors[v.approvalMethod] || "bg-gray-100 text-gray-800"}`}
//                                       >
//                                         {v.approvalMethod}
//                                       </span>
//                                       <span className="text-xs text-gray-400 ml-auto">
//                                         {formatDistanceToNow(
//                                           new Date(v.createdAt),
//                                           { addSuffix: true },
//                                         )}
//                                       </span>
//                                     </div>

//                                     <h4 className="font-bold text-[#0e2a4a] text-base">
//                                       {v.fullName}
//                                     </h4>

//                                     <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
//                                       <p className="text-xs text-gray-500 flex items-center gap-1">
//                                         <FaPhoneAlt className="text-[#ffb703]" />{" "}
//                                         {v.phone}
//                                       </p>
//                                       <p className="text-xs text-gray-500 flex items-center gap-1">
//                                         <FaBuilding className="text-[#ffb703]" />{" "}
//                                         Block {v.block}, Flat {v.flatNo}
//                                       </p>
//                                       {v.purpose && (
//                                         <p className="text-xs text-gray-500 flex items-center gap-1">
//                                           <FaClipboardList className="text-[#ffb703]" />{" "}
//                                           {v.purpose}
//                                         </p>
//                                       )}
//                                       {v.resident && (
//                                         <p className="text-xs text-blue-600 flex items-center gap-1">
//                                           <FaUserTie className="text-blue-400" />{" "}
//                                           Visiting: {v.resident.fullName}
//                                         </p>
//                                       )}
//                                     </div>

//                                     <div className="flex flex-wrap gap-3 mt-2">
//                                       {v.entryTime && (
//                                         <p className="text-xs text-green-600 flex items-center gap-1">
//                                           <FaDoorOpen /> Entry:{" "}
//                                           {format(
//                                             new Date(v.entryTime),
//                                             "hh:mm a, dd MMM",
//                                           )}
//                                         </p>
//                                       )}
//                                       {v.exitTime && (
//                                         <p className="text-xs text-red-500 flex items-center gap-1">
//                                           <FaDoorClosed /> Exit:{" "}
//                                           {format(
//                                             new Date(v.exitTime),
//                                             "hh:mm a, dd MMM",
//                                           )}
//                                         </p>
//                                       )}
//                                     </div>

//                                     {/* Vehicle details */}
//                                     {v.vehicleDetails &&
//                                       v.vehicleDetails.length > 0 && (
//                                         <div className="mt-2 flex flex-wrap gap-2">
//                                           {v.vehicleDetails.map((vd, i) => (
//                                             <span
//                                               key={i}
//                                               className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1"
//                                             >
//                                               <FaCar className="text-gray-400" />
//                                               {[
//                                                 vd.color,
//                                                 vd.model,
//                                                 vd.registrationNumber,
//                                               ]
//                                                 .filter(Boolean)
//                                                 .join(" · ")}
//                                             </span>
//                                           ))}
//                                         </div>
//                                       )}
//                                   </div>
//                                 </div>

//                                 {/* Actions */}
//                                 <div className="flex flex-col gap-2 shrink-0">
//                                   <motion.button
//                                     onClick={() => setVisitorDetailModal(v)}
//                                     className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-all"
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                   >
//                                     <FaEye className="text-xs" /> View
//                                   </motion.button>

//                                   {v.status === "PENDING" && (
//                                     <>
//                                       <GreenBtn
//                                         className="!px-3 !py-2 !text-xs"
//                                         onClick={() =>
//                                           handleApproveVisitor(v._id, "APPROVE")
//                                         }
//                                       >
//                                         <FaCheck className="text-xs" /> Approve
//                                       </GreenBtn>
//                                       <RedBtn
//                                         className="!px-3 !py-2 !text-xs"
//                                         onClick={() =>
//                                           handleApproveVisitor(v._id, "REJECT")
//                                         }
//                                       >
//                                         <FaTimes className="text-xs" /> Reject
//                                       </RedBtn>
//                                     </>
//                                   )}

//                                   {v.status === "CHECKED_IN" && (
//                                     <motion.button
//                                       onClick={() => handleMarkExit(v._id)}
//                                       className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs font-semibold flex items-center gap-1 transition-all"
//                                       whileHover={{ scale: 1.05 }}
//                                       whileTap={{ scale: 0.95 }}
//                                     >
//                                       <FaDoorClosed className="text-xs" /> Exit
//                                     </motion.button>
//                                   )}
//                                 </div>
//                               </div>
//                             </motion.div>
//                           ))}
//                         </div>
//                       )}
//                       <PaginationControls total={filteredData.length} />
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </main>
//         </div>
//       </div>

//       {/* ─── MODALS ──────────────────────────────────────────────────────────── */}

//       {/* Add Visitor */}
//       <Modal
//         open={addVisitorModal}
//         onClose={closeAddVisitorModal}
//         title="Add New Visitor"
//       >
//         {/* hidden canvas for photo capture */}
//         <canvas ref={canvasRef} className="hidden" />

//         {/* Mode Toggle */}
//         <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
//           <button
//             onClick={() => setAddMode("manual")}
//             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${addMode === "manual" ? "bg-white shadow text-[#0e2a4a]" : "text-gray-500 hover:text-gray-700"}`}
//           >
//             <FaUserPlus className="inline mr-2" /> Manual Entry
//           </button>
//           <button
//             onClick={() => setAddMode("qr")}
//             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${addMode === "qr" ? "bg-white shadow text-purple-700" : "text-gray-500 hover:text-gray-700"}`}
//           >
//             <FaQrcode className="inline mr-2" /> QR Entry
//           </button>
//         </div>

//         {/* ── MANUAL MODE ── */}
//         {addMode === "manual" && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <InputField
//                 label="Full Name *"
//                 value={addVisitorForm.fullName}
//                 onChange={(e) =>
//                   setAddVisitorForm({
//                     ...addVisitorForm,
//                     fullName: e.target.value,
//                   })
//                 }
//                 placeholder="Visitor's full name"
//               />
//               <InputField
//                 label="Phone *"
//                 type="tel"
//                 value={addVisitorForm.phone}
//                 onChange={(e) =>
//                   setAddVisitorForm({
//                     ...addVisitorForm,
//                     phone: e.target.value,
//                   })
//                 }
//                 placeholder="10-digit phone"
//               />
//             </div>
//             <InputField
//               label="Visiting For *"
//               value={addVisitorForm.visitorFor}
//               onChange={(e) =>
//                 setAddVisitorForm({
//                   ...addVisitorForm,
//                   visitorFor: e.target.value,
//                 })
//               }
//               placeholder="Who are they visiting?"
//             />
//             <InputField
//               label="Purpose"
//               value={addVisitorForm.purpose}
//               onChange={(e) =>
//                 setAddVisitorForm({
//                   ...addVisitorForm,
//                   purpose: e.target.value,
//                 })
//               }
//               placeholder="e.g. Delivery, Guest Visit"
//             />

//             {/* Resident selector — auto-fills flat/block */}
//             <div>
//               <label className="block text-sm font-semibold mb-2 text-gray-700">
//                 Resident *
//               </label>
//               <select
//                 className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb703] transition-all"
//                 value={addVisitorForm.residentId}
//                 onChange={(e) => {
//                   const sel = residents.find((r) => r._id === e.target.value);
//                   setAddVisitorForm({
//                     ...addVisitorForm,
//                     residentId: e.target.value,
//                     flatNo: sel?.flatNo || "",
//                     block: sel?.block || "",
//                     visitorFor: sel?.fullName || addVisitorForm.visitorFor,
//                   });
//                 }}
//               >
//                 <option value="">Select resident</option>
//                 {residents.map((r) => (
//                   <option key={r._id} value={r._id}>
//                     {r.fullName} — {r.block}-{r.flatNo}
//                   </option>
//                 ))}
//               </select>
//               {addVisitorForm.residentId && (
//                 <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
//                   <FaBuilding className="text-xs" /> Flat {addVisitorForm.block}
//                   -{addVisitorForm.flatNo} auto-filled
//                 </p>
//               )}
//             </div>

//             {/* Vehicle details */}
//             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
//               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
//                 Vehicle Details (Optional)
//               </p>
//               <div className="grid grid-cols-2 gap-3">
//                 <InputField
//                   placeholder="Type (Car/Bike)"
//                   value={addVisitorForm.vehicleType}
//                   onChange={(e) =>
//                     setAddVisitorForm({
//                       ...addVisitorForm,
//                       vehicleType: e.target.value,
//                     })
//                   }
//                 />
//                 <InputField
//                   placeholder="Model"
//                   value={addVisitorForm.vehicleModel}
//                   onChange={(e) =>
//                     setAddVisitorForm({
//                       ...addVisitorForm,
//                       vehicleModel: e.target.value,
//                     })
//                   }
//                 />
//                 <InputField
//                   placeholder="Color"
//                   value={addVisitorForm.vehicleColor}
//                   onChange={(e) =>
//                     setAddVisitorForm({
//                       ...addVisitorForm,
//                       vehicleColor: e.target.value,
//                     })
//                   }
//                 />
//                 <InputField
//                   placeholder="Reg. Number"
//                   value={addVisitorForm.vehicleReg}
//                   onChange={(e) =>
//                     setAddVisitorForm({
//                       ...addVisitorForm,
//                       vehicleReg: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//             </div>

//             {/* ── PHOTO CAPTURE SECTION ── */}
//             <div className="bg-gradient-to-br from-[#0e2a4a]/5 to-[#ffb703]/5 p-4 rounded-xl border border-[#ffb703]/20">
//               <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
//                 <FaCamera className="text-[#ffb703]" /> Visitor Photo
//                 (Recommended)
//               </p>

//               {/* If photo already captured/uploaded */}
//               {capturedPhoto ? (
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={capturedPhoto}
//                     alt="captured"
//                     className="w-20 h-20 rounded-xl object-cover border-2 border-[#ffb703] shadow"
//                   />
//                   <div className="flex-1">
//                     <p className="text-xs text-green-600 font-semibold mb-2 flex items-center gap-1">
//                       <FaCheck /> Photo captured
//                     </p>
//                     <button
//                       onClick={retakePhoto}
//                       className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
//                     >
//                       <FaRedo /> Retake
//                     </button>
//                     <button
//                       onClick={clearPhoto}
//                       className="text-xs flex items-center gap-1 text-red-500 hover:underline mt-1"
//                     >
//                       <FaTimes /> Remove
//                     </button>
//                   </div>
//                 </div>
//               ) : uploadedFile ? (
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={URL.createObjectURL(uploadedFile)}
//                     alt="uploaded"
//                     className="w-20 h-20 rounded-xl object-cover border-2 border-[#ffb703] shadow"
//                   />
//                   <div className="flex-1">
//                     <p className="text-xs text-green-600 font-semibold mb-2 flex items-center gap-1">
//                       <FaCheck /> Photo uploaded
//                     </p>
//                     <button
//                       onClick={clearPhoto}
//                       className="text-xs flex items-center gap-1 text-red-500 hover:underline"
//                     >
//                       <FaTimes /> Remove
//                     </button>
//                   </div>
//                 </div>
//               ) : cameraActive ? (
//                 /* Live camera view */
//                 <div className="space-y-3">
//                   <div className="relative rounded-xl overflow-hidden bg-black">
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       playsInline
//                       muted
//                       className="w-full h-48 object-cover"
//                     />
//                     <div className="absolute inset-0 border-2 border-[#ffb703]/50 rounded-xl pointer-events-none" />
//                     <div className="absolute top-2 left-2 flex items-center gap-1">
//                       <span className="relative flex h-2 w-2">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
//                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
//                       </span>
//                       <span className="text-xs text-white font-semibold bg-black/50 px-1 rounded">
//                         LIVE
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <motion.button
//                       onClick={capturePhoto}
//                       className="flex-1 py-2 bg-gradient-to-r from-[#ffb703] to-[#ffa502] text-[#0e2a4a] rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <FaCamera /> Capture Photo
//                     </motion.button>
//                     <button
//                       onClick={stopCamera}
//                       className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-all"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 /* Buttons to start camera or upload */
//                 <div className="flex gap-3">
//                   <motion.button
//                     onClick={startCamera}
//                     className="flex-1 py-3 bg-[#0e2a4a] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a4b7a] transition-all"
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <FaVideo /> Open Camera
//                   </motion.button>
//                   <label className="flex-1 cursor-pointer">
//                     <div className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
//                       <FaUpload /> Upload Photo
//                     </div>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => {
//                         const f = e.target.files[0];
//                         if (f) {
//                           setUploadedFile(f);
//                           setPhotoSource("upload");
//                         }
//                       }}
//                     />
//                   </label>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={closeAddVisitorModal}
//                 className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <GoldBtn onClick={handleAddVisitor}>
//                 <FaUserPlus className="inline mr-2 text-sm" /> Add Visitor
//               </GoldBtn>
//             </div>
//           </div>
//         )}

//         {/* ── QR MODE ── */}
//         {addMode === "qr" && (
//           <div className="space-y-4">
//             <QRScanner
//               onScanSuccess={async (decodedText) => {
//                 try {
//                   // If QR contains JSON → parse it
//                   let qrToken = decodedText;
//                   try {
//                     const parsed = JSON.parse(decodedText);
//                     qrToken = parsed.qrToken;
//                   } catch {}

//                   const r = await axios.post(
//                     `${BASE}/guard/qr-entry`, // ✅ NEW API
//                     {
//                       qrToken,
//                       fullName: "Unknown Visitor",
//                       phone: "0000000000",
//                       purpose: "QR Entry",
//                     },
//                     { withCredentials: true },
//                   );

//                   if (r.data.success) {
//                     toast.success("Visitor checked in via QR ✅");

//                     setAddVisitorModal(false);
//                     fetchVisitors();
//                     fetchSecurityStats();
//                   }
//                 } catch (err) {
//                   toast.error(err.response?.data?.message || "QR failed");
//                 }
//               }}
//               onClose={() => setAddVisitorModal(false)}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <InputField
//                 label="Visitor Name *"
//                 value={qrForm.fullName}
//                 onChange={(e) =>
//                   setQrForm({ ...qrForm, fullName: e.target.value })
//                 }
//                 placeholder="Visitor's full name"
//               />
//               <InputField
//                 label="Phone *"
//                 type="tel"
//                 value={qrForm.phone}
//                 onChange={(e) =>
//                   setQrForm({ ...qrForm, phone: e.target.value })
//                 }
//                 placeholder="10-digit phone"
//               />
//             </div>
//             <InputField
//               label="Purpose"
//               value={qrForm.purpose}
//               onChange={(e) =>
//                 setQrForm({ ...qrForm, purpose: e.target.value })
//               }
//               placeholder="e.g. Guest Visit"
//             />

//             {/* Photo for QR mode */}
//             <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
//               <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
//                 <FaCamera /> Visitor Photo (Optional)
//               </p>

//               {capturedPhoto ? (
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={capturedPhoto}
//                     alt="captured"
//                     className="w-20 h-20 rounded-xl object-cover border-2 border-purple-400 shadow"
//                   />
//                   <div>
//                     <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1">
//                       <FaCheck /> Captured
//                     </p>
//                     <button
//                       onClick={retakePhoto}
//                       className="text-xs text-blue-600 hover:underline flex items-center gap-1"
//                     >
//                       <FaRedo /> Retake
//                     </button>
//                     <button
//                       onClick={clearPhoto}
//                       className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-1"
//                     >
//                       <FaTimes /> Remove
//                     </button>
//                   </div>
//                 </div>
//               ) : uploadedFile ? (
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={URL.createObjectURL(uploadedFile)}
//                     alt="uploaded"
//                     className="w-20 h-20 rounded-xl object-cover border-2 border-purple-400 shadow"
//                   />
//                   <div>
//                     <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1">
//                       <FaCheck /> Uploaded
//                     </p>
//                     <button
//                       onClick={clearPhoto}
//                       className="text-xs text-red-500 hover:underline flex items-center gap-1"
//                     >
//                       <FaTimes /> Remove
//                     </button>
//                   </div>
//                 </div>
//               ) : cameraActive ? (
//                 <div className="space-y-3">
//                   <div className="relative rounded-xl overflow-hidden bg-black">
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       playsInline
//                       muted
//                       className="w-full h-44 object-cover"
//                     />
//                     <div className="absolute top-2 left-2 flex items-center gap-1">
//                       <span className="relative flex h-2 w-2">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
//                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
//                       </span>
//                       <span className="text-xs text-white font-semibold bg-black/50 px-1 rounded">
//                         LIVE
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <motion.button
//                       onClick={capturePhoto}
//                       className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                     >
//                       <FaCamera /> Capture
//                     </motion.button>
//                     <button
//                       onClick={stopCamera}
//                       className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-all"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex gap-3">
//                   <motion.button
//                     onClick={startCamera}
//                     className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all"
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <FaVideo /> Camera
//                   </motion.button>
//                   <label className="flex-1 cursor-pointer">
//                     <div className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
//                       <FaUpload /> Upload
//                     </div>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => {
//                         const f = e.target.files[0];
//                         if (f) {
//                           setUploadedFile(f);
//                           setPhotoSource("upload");
//                         }
//                       }}
//                     />
//                   </label>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setQrScanModal(false);
//                   clearPhoto();
//                   setQrForm({
//                     qrToken: "",
//                     fullName: "",
//                     phone: "",
//                     purpose: "General Visit",
//                   });
//                 }}
//                 className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <motion.button
//                 onClick={handleQRScan}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <FaQrcode className="inline mr-2 text-sm" /> Verify & Check In
//               </motion.button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Visitor Detail */}
//       <Modal
//         open={!!visitorDetailModal}
//         onClose={() => setVisitorDetailModal(null)}
//         title="Visitor Details"
//       >
//         {visitorDetailModal && (
//           <div className="space-y-4">
//             {/* Photo + basic info */}
//             <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
//               {visitorDetailModal.photo?.url ? (
//                 <img
//                   src={visitorDetailModal.photo.url}
//                   alt={visitorDetailModal.fullName}
//                   className="w-16 h-16 rounded-full object-cover border-2 border-[#ffb703]"
//                 />
//               ) : (
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0e2a4a] to-[#1a4b7a] flex items-center justify-center text-white font-bold text-xl">
//                   {visitorDetailModal.fullName?.charAt(0)?.toUpperCase()}
//                 </div>
//               )}
//               <div>
//                 <h4 className="font-bold text-[#0e2a4a] text-lg">
//                   {visitorDetailModal.fullName}
//                 </h4>
//                 <p className="text-gray-500 text-sm">
//                   {visitorDetailModal.phone}
//                 </p>
//                 <div className="flex gap-2 mt-1">
//                   <span
//                     className={`px-2 py-0.5 text-xs rounded-full font-semibold ${StatusColors[visitorDetailModal.status] || "bg-gray-100 text-gray-800"}`}
//                   >
//                     {visitorDetailModal.status}
//                   </span>
//                   <span
//                     className={`px-2 py-0.5 text-xs rounded-full ${MethodColors[visitorDetailModal.approvalMethod] || "bg-gray-100 text-gray-800"}`}
//                   >
//                     {visitorDetailModal.approvalMethod}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 {
//                   label: "Flat",
//                   value: `${visitorDetailModal.block}-${visitorDetailModal.flatNo}`,
//                 },
//                 {
//                   label: "Visiting For",
//                   value: visitorDetailModal.visitorFor || "—",
//                 },
//                 {
//                   label: "Purpose",
//                   value: visitorDetailModal.purpose || "General Visit",
//                 },
//                 {
//                   label: "Resident",
//                   value: visitorDetailModal.resident?.fullName || "—",
//                 },
//                 {
//                   label: "Entry Time",
//                   value: visitorDetailModal.entryTime
//                     ? format(
//                         new Date(visitorDetailModal.entryTime),
//                         "dd MMM yyyy, hh:mm a",
//                       )
//                     : "—",
//                 },
//                 {
//                   label: "Exit Time",
//                   value: visitorDetailModal.exitTime
//                     ? format(
//                         new Date(visitorDetailModal.exitTime),
//                         "dd MMM yyyy, hh:mm a",
//                       )
//                     : "Not Exited",
//                 },
//               ].map((item) => (
//                 <div key={item.label} className="bg-gray-50 p-3 rounded-xl">
//                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
//                     {item.label}
//                   </p>
//                   <p className="text-sm font-medium text-[#0e2a4a]">
//                     {item.value}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {visitorDetailModal.vehicleDetails?.length > 0 && (
//               <div className="bg-gray-50 p-4 rounded-xl">
//                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
//                   Vehicle
//                 </p>
//                 {visitorDetailModal.vehicleDetails.map((vd, i) => (
//                   <p
//                     key={i}
//                     className="text-sm text-gray-700 flex items-center gap-2"
//                   >
//                     <FaCar className="text-[#ffb703]" />
//                     {[vd.type, vd.color, vd.model, vd.registrationNumber]
//                       .filter(Boolean)
//                       .join(" · ")}
//                   </p>
//                 ))}
//               </div>
//             )}

//             <div className="flex justify-end gap-3 pt-2">
//               {visitorDetailModal.status === "PENDING" && (
//                 <>
//                   <GreenBtn
//                     onClick={() => {
//                       handleApproveVisitor(visitorDetailModal._id, "APPROVE");
//                       setVisitorDetailModal(null);
//                     }}
//                   >
//                     <FaCheck className="text-xs mr-1" /> Approve
//                   </GreenBtn>
//                   <RedBtn
//                     onClick={() => {
//                       handleApproveVisitor(visitorDetailModal._id, "REJECT");
//                       setVisitorDetailModal(null);
//                     }}
//                   >
//                     <FaTimes className="text-xs mr-1" /> Reject
//                   </RedBtn>
//                 </>
//               )}
//               {visitorDetailModal.status === "CHECKED_IN" && (
//                 <motion.button
//                   onClick={() => {
//                     handleMarkExit(visitorDetailModal._id);
//                     setVisitorDetailModal(null);
//                   }}
//                   className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <FaDoorClosed className="text-sm" /> Mark Exit
//                 </motion.button>
//               )}
//               <button
//                 onClick={() => setVisitorDetailModal(null)}
//                 className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default SecurityDashboard;
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

const BASE = "http://localhost:8000";

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
