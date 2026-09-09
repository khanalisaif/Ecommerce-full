import express from "express";
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  toggleCouponStatus,
} from "../../controllers/admin/coupon.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.delete("/:id", deleteCoupon);
router.patch("/:id/toggle", toggleCouponStatus);

export default router;
