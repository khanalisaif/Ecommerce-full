import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Coupon from "../../models/admin/Coupon.model.js";

// @route POST /api/user/coupons/apply
// Validates a coupon code against the user's cart total
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code?.trim()) throw new ApiError(400, "Please enter a coupon code");
  const subtotal = Number(cartTotal);
  if (isNaN(subtotal) || subtotal <= 0) {
    throw new ApiError(400, "A valid cart total is required to apply coupon");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    throw new ApiError(404, `Coupon code "${cleanCode}" is invalid`);
  }

  if (!coupon.isActive) {
    throw new ApiError(400, `Coupon "${cleanCode}" is no longer active`);
  }

  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    throw new ApiError(400, `Coupon "${cleanCode}" is not yet active`);
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    throw new ApiError(400, `Coupon "${cleanCode}" has expired`);
  }

  if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required to use this coupon`
    );
  }

  // Calculate discount
  let calculatedDiscount = 0;
  if (coupon.discountType === "percentage") {
    calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
      calculatedDiscount = coupon.maxDiscountAmount;
    }
  } else {
    calculatedDiscount = Math.min(subtotal, coupon.discountValue);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        code: coupon.code,
        discount: calculatedDiscount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        minOrderAmount: coupon.minOrderAmount,
      },
      `Coupon "${coupon.code}" applied successfully! You saved ₹${calculatedDiscount.toLocaleString("en-IN")}`
    )
  );
});

// @route GET /api/user/coupons/available
// Fetches active, unexpired coupons for storefront / checkout display
export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    validUntil: { $gte: now },
  })
    .select("code description discountType discountValue minOrderAmount validUntil")
    .sort({ discountValue: -1 });

  res.status(200).json(new ApiResponse(200, { coupons }, "Available coupons fetched"));
});
