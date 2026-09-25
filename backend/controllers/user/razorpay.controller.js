import Razorpay from "razorpay";
import crypto from "crypto";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: pick the correct key pair based on RAZORPAY_ENV or an explicit mode
// ─────────────────────────────────────────────────────────────────────────────
const getRazorpayInstance = (mode) => {
  const isLive =
    mode === "live" || process.env.RAZORPAY_ENV === "live";

  const key_id = isLive
    ? process.env.RAZORPAY_LIVE_KEY_ID
    : process.env.RAZORPAY_TEST_KEY_ID;

  const key_secret = isLive
    ? process.env.RAZORPAY_LIVE_KEY_SECRET
    : process.env.RAZORPAY_TEST_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new ApiError(
      500,
      `Razorpay ${isLive ? "live" : "test"} keys are not configured in .env`
    );
  }

  const instance = new Razorpay({ key_id, key_secret });
  return { instance, key_id, key_secret, isLive };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣  POST /api/razorpay/create-order
//     Body: { amount (₹), currency?, receipt?, mode? }
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, mode } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw new ApiError(400, "A valid amount (in ₹) is required");
  }

  const { instance, key_id, isLive } = getRazorpayInstance(mode);

  // Razorpay works in paise (₹1 = 100 paise)
  const options = {
    amount: Math.round(Number(amount) * 100),
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };

  const order = await instance.orders.create(options);

  return res.status(200).json(
    new ApiResponse(200, { order, key_id, mode: isLive ? "live" : "test" }, "Order created")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 2️⃣  POST /api/razorpay/verify-payment
//     Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, mode? }
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    mode,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "razorpay_order_id, razorpay_payment_id and razorpay_signature are required");
  }

  const { key_secret } = getRazorpayInstance(mode);

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment signature verification failed — possible tampering");
  }

  // ✅ Signature matched — payment is authentic.
  // TODO (project-specific): update order.paymentStatus = 'paid' here if needed
  return res.status(200).json(
    new ApiResponse(200, { paymentId: razorpay_payment_id }, "Payment verified successfully")
  );
});
