import express from "express";
import {
  handleVisitorAdd,
  markVisitorExit,
  getAllVisitor,
  approveVisitor,
  addVisitorByQR
} from "../controllersGuard/visitors.controller.js";
import { verifier } from "../middlewares/verifyCookie.middleware.js";
import { getAllguard } from "../controllersGuard/guard.controller.js";

const guardRoutes = express.Router();

guardRoutes.post("/visitor/add", verifier, handleVisitorAdd);
guardRoutes.patch("/visitor/exit/:visitorId", verifier, markVisitorExit);
guardRoutes.patch("/visitor/approve/:visitorId", verifier, approveVisitor);
guardRoutes.get("/guards", getAllguard);
guardRoutes.get("/visitor", verifier, getAllVisitor);
guardRoutes.post("/qr",  addVisitorByQR);

export { guardRoutes };
