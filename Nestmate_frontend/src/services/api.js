import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// ── Auth ────────────────────────────────────────────────────
export const loginResident = (data) => API.post("/user/resident/login", data);
export const loginAdmin = (data) => API.post("/user/admin/login", data);
export const loginGuard = (data) => API.post("/user/guard/login", data);
export const signupResident = (data) => API.post("/user/resident/signup", data);
export const signupGuard = (data) => API.post("/user/guard/signup", data);
export const logoutUser = () => API.post("/user/logout");

// ── Resident ─────────────────────────────────────────────────
export const getVisitors = () => API.get("/resident/getVisitor");
export const getNotices = () => API.get("/resident/getNotices");
export const getComplaints = () => API.get("/resident/getComplaint");
export const createComplaint = (data) => API.post("/resident/createComplaint", data);
export const upvoteComplaint = (id) => API.post(`/resident/upvoteComplaint/${id}`);
export const addComplaintComment = (id, data) => API.post(`/resident/complaint/${id}/comment`, data);
export const getAllResidents = () => API.get("/resident/all");

// ── Profile ───────────────────────────────────────────────────
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.patch("/profile/update", data);
export const updateProfilePhoto = (formData) =>
  API.patch("/profile/photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateNotificationPrefs = (data) => API.patch("/profile/notifications", data);

// ── Notifications ─────────────────────────────────────────────
export const fetchNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// ── QR Visitor Pass ───────────────────────────────────────────
export const generateVisitorPass = (data) => API.post("/qr/generate", data);
export const getMyVisitorPasses = () => API.get("/qr/my-passes");
export const scanQR = (data) => API.post("/qr/scan", data);

// ── Guard ─────────────────────────────────────────────────────
export const addVisitor = (formData) =>
  API.post("/guard/visitor/add", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const markVisitorExit = (id) => API.patch(`/guard/visitor/exit/${id}`);
export const approveVisitor = (id, action) => API.patch(`/guard/visitor/approve/${id}`, { action });
export const getAllVisitors = (params) => API.get("/guard/visitor", { params });
export const getAllGuards = () => API.get("/guard/guards");

// ── Admin ─────────────────────────────────────────────────────
export const getAllComplaints = (params) => API.get("/superadmin/complaints/get", { params });
export const updateComplaintStatus = (id, data) => API.patch(`/superadmin/complaints/update/${id}`, data);
export const resolveComplaint = (data) => API.post("/superadmin/complaints/resolve", data);
export const createNotice = (data) => API.post("/superadmin/notices/create", data);
export const deleteNotice = (id) => API.delete(`/superadmin/notices/delete/${id}`);
export const getAllNoticesAdmin = () => API.get("/superadmin/notices/show");
export const addGuard = (data) => API.post("/superadmin/guards/add", data);
export const deleteGuard = (id) => API.delete(`/superadmin/guards/delete/${id}`);
export const addHouse = (data) => API.post("/superadmin/houses/add", data);
export const allotHouse = (data) => API.post("/superadmin/houses/allot", data);

// ── Analytics ─────────────────────────────────────────────────
export const getAdminDashboard = () => API.get("/analytics/dashboard");
export const getSecurityDashboard = () => API.get("/analytics/security");
export const getResidentDashboard = () => API.get("/analytics/resident");


export const getServices = () => API.get("user/resident/getService");
export const getMyBillables = () => API.get("/resident/seeBillables");
export const addToBill = (id, data) => API.post(`/resident/addToBill/${id}`, data);
export const deleteFromBill = (id) => API.delete(`/resident/deleteFromBill/${id}`);
export const rateVendor = (id, data) => API.post(`/resident/rateVendor/${id}`, data);






export default API;
