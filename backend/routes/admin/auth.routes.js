import express from "express";
import {
  registerAdmin,
  loginAdmin,
  requestAdminOtpLogin,
  verifyAdminOtpLogin,
  logoutAdmin,
  getAdminMe,
} from "../../controllers/admin/auth.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.post("/register", registerAdmin); // consider protecting/disabling after initial setup
router.post("/login", loginAdmin);
router.post("/request-otp-login", requestAdminOtpLogin);
router.post("/verify-otp-login", verifyAdminOtpLogin);
router.post("/logout", logoutAdmin);
router.get("/me", protectAdmin, getAdminMe);

export default router;
