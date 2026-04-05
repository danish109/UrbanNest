import express from "express";
import { registerSociety,getAllSocieties } from "../ControllerSociety/societyController.js";

const router = express.Router();

/* Register new society */

router.post("/register", registerSociety);
router.get("/all", getAllSocieties);

export default router;