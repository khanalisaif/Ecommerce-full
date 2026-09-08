import express from "express";
import {
  signup, verifySignupOtp, resendSignupOtp, login, requestOtpLogin, verifyOtpLogin,
  forgotPassword, resetPassword, checkResetToken, googleAuth, facebookAuth,
  logout, getMe,
} from "../../controllers/user/auth.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/resend-signup-otp", resendSignupOtp);
router.post("/login", login);
router.post("/request-otp-login", requestOtpLogin);
router.post("/verify-otp-login", verifyOtpLogin);

router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token/valid", checkResetToken);
router.post("/reset-password/:token", resetPassword);

router.post("/google", googleAuth);
router.post("/facebook", facebookAuth);

router.post("/logout", logout);
router.get("/me", protectUser, getMe);

export default router;
