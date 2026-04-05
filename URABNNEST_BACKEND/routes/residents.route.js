import express from "express";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import {
  getVisitorInfo,
  getNotices,
  createComplaint,
  getComplaint,
  upvote,
  getService,
  addToBill,
  deleteFromBill,
  updateInBill,
  rateVendor,
  seeBillables,
  getAllResidents,
  addComplaintComment,
} from "../controllersResident/residentpanel.controller.js";

const residentRoute = express.Router();

residentRoute.get("/getVisitor", verifier, getVisitorInfo);
residentRoute.get("/getNotices", verifier, getNotices);
residentRoute.post("/createComplaint", verifier, createComplaint);
residentRoute.get("/getComplaint", verifier, getComplaint);
residentRoute.post("/upvoteComplaint/:id", verifier, upvote);
residentRoute.post("/complaint/:id/comment", verifier, addComplaintComment);
residentRoute.get("/getService", verifier, getService);
residentRoute.post("/addToBill/:id", verifier, addToBill);
residentRoute.delete("/deleteFromBill/:id", verifier, deleteFromBill);
residentRoute.put("/updateInBill/:id", verifier, updateInBill);
residentRoute.post("/rateVendor/:id", verifier, rateVendor);
residentRoute.get("/seeBillables", verifier, seeBillables);
residentRoute.get("/all", getAllResidents);

export { residentRoute };
