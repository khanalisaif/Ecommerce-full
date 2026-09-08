import express from "express";
import { getOverview, getInventoryOverview } from "../../controllers/admin/dashboard.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/overview", getOverview);
router.get("/inventory", getInventoryOverview);

export default router;
