import express from "express";
import { solveSocietyQuery } from "../aicontroller/aiController.js";

const router = express.Router();

router.post("/chat", solveSocietyQuery);

export default router;
