import express from "express";
import { createOrder, verifyPayment } from "../../controllers/user/razorpay.controller.js";
import { optionalUserAuth } from "../../middleware/userAuth.js";

const router = express.Router();

// No hard auth block — Razorpay security is enforced by HMAC signature on /verify-payment.
// optionalUserAuth attaches req.user if a valid token is present, but never blocks guests.
router.use(optionalUserAuth);

// POST /api/razorpay/create-order  — create a Razorpay order
router.post("/create-order", createOrder);

// POST /api/razorpay/verify-payment — verify signature after payment
router.post("/verify-payment", verifyPayment);

export default router;
