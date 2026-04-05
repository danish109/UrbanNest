import React, { useState, useEffect, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import {
  FaSync, FaVideo, FaHistory, FaBell, FaShieldAlt,
  FaDatabase, FaSearch, FaPlus, FaFilter,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight, FaPlay, FaStop,
} from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";
import AddVehicleModal from "../components/AddVehicleModal";
import { Link } from "react-router-dom";
import logo from "../assets/logo5.png";

// ── API Config ──────────────────────────────────────────────────────────────
// REPLACE with this
const NODE_URL   = `${import.meta.env.VITE_API_URL}/api`;
const PYTHON_URL = import.meta.env.VITE_ANPR_URL;

const api = {
  getLogs:          (page = 1, limit = 10) => axios.get(`${NODE_URL}/vehicles/logs?page=${page}&limit=${limit}`),
  getAllowedVehicles:()                      => axios.get(`${NODE_URL}/vehicles/allowed`),
  addVehicle:       (data)                  => axios.post(`${NODE_URL}/vehicles/allowed`, data),
  deleteVehicle:    (id)                    => axios.delete(`${NODE_URL}/vehicles/allowed/${id}`),
  healthPython:     ()                      => axios.get(`${PYTHON_URL}/api/health`),
  healthBackend:    ()                      => axios.get(`${NODE_URL}/vehicles/health`),
  cameraStart:      ()                      => axios.post(`${PYTHON_URL}/api/camera/start`),
  cameraStop:       ()                      => axios.post(`${PYTHON_URL}/api/camera/stop`),
  cameraStatus:     ()                      => axios.get(`${PYTHON_URL}/api/camera/status`),
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColors = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger:  "bg-red-100 text-red-800 border-red-200",
  gray:    "bg-gray-100 text-gray-800 border-gray-200",
};

const StatusIcon = ({ level }) => {
  if (level === "success") return <FaCheckCircle className="text-green-500" />;
  if (level === "warning") return <FaExclamationTriangle className="text-yellow-500" />;
  return <FaTimesCircle className="text-red-500" />;
};

// ── Component ────────────────────────────────────────────────────────────────
const SecurityDashboard = () => {
  const [logs, setLogs]                     = useState([]);
  const [allowedVehicles, setAllowedVehicles] = useState([]);
  const [loading, setLoading]               = useState({ logs: true, vehicles: true, health: true, camera: false });
  const [serviceStatus, setServiceStatus]   = useState({ python: "checking", backend: "checking" });
  const [cameraActive, setCameraActive]     = useState(false);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [newVehicle, setNewVehicle]         = useState({ licensePlate: "", flatNumber: "", ownerName: "" });
  const [stats, setStats]                   = useState({ totalEntries: 0, allowedToday: 0, deniedToday: 0 });
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [pagination, setPagination]         = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 10, hasNextPage: false, hasPrevPage: false,
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || log.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const overallStatus = (() => {
    if (serviceStatus.python === "healthy" && serviceStatus.backend === "online") return "success";
    if (serviceStatus.python === "camera_not_ready" && serviceStatus.backend === "online") return "warning";
    return "danger";
  })();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async (page = 1) => {
    setLoading(p => ({ ...p, logs: true, vehicles: true }));
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        api.getLogs(page, pagination.itemsPerPage),
        api.getAllowedVehicles(),
      ]);

      const logs = logsRes.data.logs || [];
      setLogs(logs);
      setAllowedVehicles(vehiclesRes.data || []);

      if (logsRes.data.pagination) setPagination(logsRes.data.pagination);

      const today = new Date().toDateString();
      const todayLogs = logs.filter(l => new Date(l.createdAt).toDateString() === today);
      setStats({
        totalEntries:  logs.length,
        allowedToday:  todayLogs.filter(l => l.status === "ALLOWED").length,
        deniedToday:   todayLogs.filter(l => l.status === "NOT_ALLOWED").length,
      });
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(p => ({ ...p, logs: false, vehicles: false }));
    }
  }, [pagination.itemsPerPage]);

  const checkHealth = useCallback(async () => {
    setLoading(p => ({ ...p, health: true }));
    try {
      const [pyRes, beRes] = await Promise.allSettled([
        api.healthPython(),
        api.healthBackend(),
      ]);
      const pyStatus = pyRes.status === "fulfilled" ? pyRes.value.data.status : "offline";
      const beStatus = beRes.status === "fulfilled" ? "online" : "offline";
      setServiceStatus({ python: pyStatus, backend: beStatus });

      // Sync camera active state from backend
      if (pyStatus !== "offline") {
        const camRes = await api.cameraStatus().catch(() => null);
        if (camRes) setCameraActive(camRes.data.active);
      }
    } catch (e) {
      setServiceStatus({ python: "offline", backend: "offline" });
    } finally {
      setLoading(p => ({ ...p, health: false }));
    }
  }, []);

  // ── Camera controls ────────────────────────────────────────────────────────
  const handleCameraToggle = async () => {
    setLoading(p => ({ ...p, camera: true }));
    try {
      if (cameraActive) {
        await api.cameraStop();
        setCameraActive(false);
      } else {
        await api.cameraStart();
        setCameraActive(true);
      }
      await checkHealth();
    } catch (e) {
      console.error("Camera toggle failed:", e);
    } finally {
      setLoading(p => ({ ...p, camera: false }));
    }
  };

  // ── Vehicle CRUD ───────────────────────────────────────────────────────────
  const handleAddVehicle = async () => {
    if (!newVehicle.licensePlate || !newVehicle.flatNumber) {
      alert("License plate and flat number are required");
      return;
    }
    try {
      await api.addVehicle(newVehicle);
      setShowAddModal(false);
      setNewVehicle({ licensePlate: "", flatNumber: "", ownerName: "" });
      const res = await api.getAllowedVehicles();
      setAllowedVehicles(res.data);
    } catch (e) {
      console.error("Add vehicle failed:", e);
      alert("Failed to add vehicle. Please try again.");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Remove this vehicle from the allowed list?")) return;
    try {
      await api.deleteVehicle(id);
      const res = await api.getAllowedVehicles();
      setAllowedVehicles(res.data);
    } catch (e) {
      console.error("Delete vehicle failed:", e);
      alert("Failed to remove vehicle.");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) fetchAllData(page);
  };

  const pageNumbers = (() => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, pagination.currentPage - Math.floor(max / 2));
    let end   = Math.min(pagination.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllData(1);
    checkHealth();
    const logInterval    = setInterval(() => fetchAllData(pagination.currentPage), 10_000);
    const healthInterval = setInterval(checkHealth, 30_000);
    return () => { clearInterval(logInterval); clearInterval(healthInterval); };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <motion.nav
        className="bg-[#0e2a4a] text-white shadow-2xl relative z-50 border-b border-white/20"
        initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-8xl px-8 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md">
              <img src={logo} alt="UrbanNest" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              UrbanNest
            </span>
            <span className="hidden md:block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-widest border border-teal-500/30">
              Gate Monitoring
            </span>
          </Link>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* System Status Banner */}
        <div className={`rounded-lg p-4 mb-6 border ${statusColors[overallStatus]}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusIcon level={overallStatus} />
              <span className="font-medium">
                <strong>System Status:</strong>{" "}
                {overallStatus === "success" ? "All Systems Operational"
                  : overallStatus === "warning" ? "Partial — Camera Initializing"
                  : "System Offline — Check Services"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[overallStatus]}`}>
                {overallStatus === "success" ? "OK" : overallStatus === "warning" ? "WARNING" : "CRITICAL"}
              </span>
              <button
                onClick={checkHealth}
                disabled={loading.health}
                className="bg-[#112f5a] text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-[#1e3a5f] flex items-center gap-1"
              >
                {loading.health ? <Spinner animation="border" size="sm" /> : <FaSync />}
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { icon: <FaDatabase className="text-[#0e2a4a] text-2xl" />, value: stats.totalEntries, label: "Total Entries" },
            { icon: <FaShieldAlt className="text-green-600 text-2xl" />, value: stats.allowedToday, label: "Allowed Today" },
            { icon: <FaShieldAlt className="text-red-600 text-2xl"   />, value: stats.deniedToday,  label: "Denied Today"  },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-200">
              <div className="mb-2">{icon}</div>
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              <p className="text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Camera + Logs row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Live Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">

              {/* Camera header with Start/Stop */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h5 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FaVideo className="text-[#0e2a4a]" />
                  Live Camera Feed
                </h5>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    cameraActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cameraActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                    {cameraActive ? "Live" : "Inactive"}
                  </span>
                  <button
                    onClick={handleCameraToggle}
                    disabled={loading.camera || serviceStatus.python === "offline"}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      cameraActive
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading.camera
                      ? <Spinner animation="border" size="sm" />
                      : cameraActive ? <><FaStop /> Stop</> : <><FaPlay /> Start</>
                    }
                  </button>
                </div>
              </div>

              {/* Feed */}
              <div className="bg-black">
                {cameraActive && (serviceStatus.python === "healthy" || serviceStatus.python === "camera_not_ready") ? (
                  <img
                    src={`${PYTHON_URL}/video_feed`}
                    alt="Live Security Feed"
                    className="w-full h-96 object-cover"
                    onError={() => setServiceStatus(p => ({ ...p, python: "offline" }))}
                  />
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <FaVideo className="text-4xl opacity-30" />
                    <p className="text-sm">
                      {serviceStatus.python === "offline"
                        ? "AI service offline — start the Python server"
                        : "Camera is stopped — press Start to begin monitoring"}
                    </p>
                    {!cameraActive && serviceStatus.python !== "offline" && (
                      <button
                        onClick={handleCameraToggle}
                        disabled={loading.camera}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                      >
                        <FaPlay /> Start Camera
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-2 text-sm text-gray-500">
                Camera 1 — Main Entrance
              </div>
            </div>
          </div>

          {/* Service Status side panel */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h5 className="text-lg font-medium text-gray-900 mb-4">Service Status</h5>
              <div className="space-y-3">
                {[
                  {
                    label: "AI / ANPR Service",
                    status: serviceStatus.python,
                    ok: serviceStatus.python === "healthy",
                    warn: serviceStatus.python === "camera_not_ready",
                    description: serviceStatus.python === "healthy"
                      ? "Running & camera active"
                      : serviceStatus.python === "camera_not_ready"
                      ? "Running — camera initializing"
                      : "Offline",
                  },
                  {
                    label: "Node.js Backend",
                    status: serviceStatus.backend,
                    ok: serviceStatus.backend === "online",
                    warn: false,
                    description: serviceStatus.backend === "online" ? "Online" : "Offline",
                  },
                ].map(svc => (
                  <div key={svc.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="mt-0.5">
                      {svc.ok
                        ? <FaCheckCircle className="text-green-500" />
                        : svc.warn
                        ? <FaExclamationTriangle className="text-yellow-500" />
                        : <FaTimesCircle className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{svc.label}</p>
                      <p className="text-xs text-gray-500">{svc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logs + Allowed Vehicles row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* Entry Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h5 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FaHistory className="text-[#0e2a4a]" />
                  Entry Logs
                </h5>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0e2a4a]"
                  >
                    <option value="all">All Status</option>
                    <option value="ALLOWED">Allowed Only</option>
                    <option value="NOT_ALLOWED">Not Allowed</option>
                  </select>
                  <button
                    onClick={() => fetchAllData(pagination.currentPage)}
                    disabled={loading.logs}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {loading.logs ? <Spinner animation="border" size="sm" /> : <FaSync />}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search license plates..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0e2a4a]"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading.logs ? (
                  <div className="text-center py-8">
                    <Spinner animation="border" />
                    <p className="mt-2 text-gray-500 text-sm">Loading logs...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No entry logs found</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["License Plate", "Status", "Confidence", "Date", "Time"].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map(log => (
                        <tr key={log._id || log.timestamp} className={log.status === "ALLOWED" ? "bg-green-50" : "bg-red-50"}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.licensePlate}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === "ALLOWED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>{log.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {log.confidence ? `${(log.confidence * 100).toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(log.createdAt || log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(log.createdAt || log.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!loading.logs && filteredLogs.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span>
                    {" "}–{" "}
                    <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span>
                    {" "}of{" "}
                    <span className="font-medium">{pagination.totalItems}</span>
                  </p>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    {pageNumbers.map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? "z-10 bg-[#0e2a4a] border-[#0e2a4a] text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Allowed Vehicles */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h5 className="text-lg font-medium text-gray-900">Allowed Vehicles</h5>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-[#0e2a4a] hover:bg-[#112f5a]"
                >
                  <FaPlus /> Add
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading.vehicles ? (
                  <div className="text-center py-8">
                    <Spinner animation="border" />
                    <p className="mt-2 text-gray-500 text-sm">Loading...</p>
                  </div>
                ) : allowedVehicles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No allowed vehicles</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Plate", "Flat", "Action"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allowedVehicles.map(v => (
                        <tr key={v._id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.licensePlate}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{v.flatNumber}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleDeleteVehicle(v._id)}
                              className="px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddVehicleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        newVehicle={newVehicle}
        setNewVehicle={setNewVehicle}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
};

export default SecurityDashboard;