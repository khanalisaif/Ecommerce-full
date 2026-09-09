import express from "express";
import { subscribe, unsubscribe } from "../../controllers/user/subscribe.controller.js";

const router = express.Router();

// POST /api/user/subscribe — subscribe an email (no auth required)
router.post("/", subscribe);

// GET /api/user/unsubscribe/:token — one-click unsubscribe from email link
router.get("/unsubscribe/:token", unsubscribe);

export default router;
