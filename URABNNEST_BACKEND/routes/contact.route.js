import express from "express";
import { sendContactMessage } from "../contactbox/contact.controller.js"

const router = express.Router();

router.post("/send-message", sendContactMessage);

export default router;
