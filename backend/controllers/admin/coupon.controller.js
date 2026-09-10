import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Coupon from "../../models/admin/Coupon.model.js";
import User from "../../models/user/User.model.js";
import Subscriber from "../../models/user/Subscriber.model.js";
import { sendCouponOfferEmail } from "../../utils/sendEmail.js";

// @route POST /api/admin/coupons
// Creates a new coupon and optionally broadcasts it to users with 'offers' notifications enabled
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description = "",
    discountType = "percentage",
    discountValue,
    minOrderAmount = 0,
    validFrom,
    validUntil,
    broadcastEmail = true,
  } = req.body;

  if (!code?.trim()) throw new ApiError(400, "Coupon code is required");
  if (!discountValue || Number(discountValue) <= 0) {
    throw new ApiError(400, "Valid discount value is required");
  }
  if (!validUntil) throw new ApiError(400, "Coupon expiration date (validUntil) is required");

  const cleanCode = code.trim().toUpperCase();

  const existing = await Coupon.findOne({ code: cleanCode });
  if (existing) throw new ApiError(409, `Coupon with code "${cleanCode}" already exists`);

  const coupon = await Coupon.create({
    code: cleanCode,
    description: description.trim(),
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: new Date(validUntil),
    isActive: true,
  });

  let broadcastCount = 0;
  if (broadcastEmail) {
    // 1. Fetch unsubscribed emails so we NEVER send offers to them
    const unsubscribedList = await Subscriber.find({ isActive: false }).distinct("email");
    const unsubscribedSet = new Set(unsubscribedList.map((e) => e.toLowerCase()));

    // 2. Registered users who want offers
    const subscribers = await User.find({
      isActive: true,
      email: { $exists: true, $ne: null },
      "preferences.notifications.offers": { $ne: false },
    }).select("email");

    // 3. Active newsletter subscribers
    const activeSubs = await Subscriber.find({ isActive: true }).select("email");

    // 4. Combine and filter out unsubscribed emails
    const emailSet = new Set();
    for (const u of subscribers) {
      if (u.email) {
        const em = u.email.trim().toLowerCase();
        if (!unsubscribedSet.has(em)) emailSet.add(em);
      }
    }
    for (const s of activeSubs) {
      if (s.email) {
        const em = s.email.trim().toLowerCase();
        if (!unsubscribedSet.has(em)) emailSet.add(em);
      }
    }

    const emails = Array.from(emailSet);
    if (emails.length > 0) {
      Promise.allSettled(emails.map((to) => sendCouponOfferEmail(to, { coupon }))).catch((err) =>
        console.error("Coupon broadcast error:", err.message)
      );
      broadcastCount = emails.length;
    }
  }

  res.status(201).json(
    new ApiResponse(
      201,
      { coupon, broadcastCount },
      `Coupon created successfully${broadcastCount > 0 ? ` and emailed to ${broadcastCount} subscriber(s)` : ""}`
    )
  );
});

// @route GET /api/admin/coupons
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { coupons }, "Coupons fetched"));
});

// @route DELETE /api/admin/coupons/:id
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Coupon deleted successfully"));
});

// @route PATCH /api/admin/coupons/:id/toggle
export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.status(200).json(new ApiResponse(200, { coupon }, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`));
});
