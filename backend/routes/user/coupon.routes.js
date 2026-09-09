import express from "express";
import { applyCoupon, getAvailableCoupons } from "../../controllers/user/coupon.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.get("/available", getAvailableCoupons);
router.post("/apply", protectUser, applyCoupon);

export default router;
