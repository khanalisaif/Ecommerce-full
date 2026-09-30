import express from "express";
import { recordProductView, getProductsAnalytics, getProductViewers } from "../../controllers/admin/analytics.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";
import { optionalUserAuth } from "../../middleware/userAuth.js";

const router = express.Router();

// Public (user side) — optionalUserAuth so req.user is set if logged in
router.post("/product-view", optionalUserAuth, recordProductView);

// Admin only
router.get("/products", protectAdmin, getProductsAnalytics);
router.get("/products/:productId/viewers", protectAdmin, getProductViewers);

export default router;
