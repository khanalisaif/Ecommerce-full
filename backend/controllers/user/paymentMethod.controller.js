import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";

// @route GET /api/user/payment-methods
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, { paymentMethods: user.paymentMethods }, "Payment methods fetched"));
});

// @route POST /api/user/payment-methods
// Body for a card: { type: 'card', number, cardHolderName, expiry }
//   — only the last 4 digits of `number` are ever persisted; the full
//   number and any CVV are never sent past this request and never stored.
// Body for UPI: { type: 'upi', upiId }
export const addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, number, cardHolderName, expiry, upiId } = req.body;

  const user = await User.findById(req.user._id);

  if (type === "card") {
    if (!number || !cardHolderName || !expiry) {
      throw new ApiError(400, "number, cardHolderName and expiry are required for a card");
    }
    const last4 = String(number).replace(/\s/g, "").slice(-4);
    user.paymentMethods.push({ type: "card", last4, cardHolderName, expiry });
  } else if (type === "upi") {
    if (!upiId || !upiId.includes("@")) throw new ApiError(400, "A valid UPI ID is required");
    user.paymentMethods.push({ type: "upi", upiId });
  } else {
    throw new ApiError(400, "type must be 'card' or 'upi'");
  }

  await user.save();
  res.status(201).json(new ApiResponse(201, { paymentMethods: user.paymentMethods }, "Payment method added"));
});

// @route DELETE /api/user/payment-methods/:id
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const method = user.paymentMethods.id(req.params.id);
  if (!method) throw new ApiError(404, "Payment method not found");

  method.deleteOne();
  await user.save();

  res.status(200).json(new ApiResponse(200, { paymentMethods: user.paymentMethods }, "Payment method removed"));
});
