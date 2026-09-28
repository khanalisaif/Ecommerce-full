import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user/User.model.js";
import { generateUniqueReferralCode } from "../../utils/referralCode.js";

// @route GET /api/user/wallet
// Returns user's wallet balance, transaction history, referral code, and referral stats
export const getMyWallet = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user._id).select("fullName email walletBalance walletHistory referralCode");
  if (!user) throw new ApiError(404, "User not found");

  // Ensure user has a unique 4-digit referral code
  if (!user.referralCode) {
    user.referralCode = await generateUniqueReferralCode();
    await user.save();
  }

  // Count how many users registered using this user's referral code
  const referralCount = await User.countDocuments({ referredBy: user._id });

  const walletHistory = (user.walletHistory || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        walletBalance: user.walletBalance || 0,
        referralCode: user.referralCode,
        referralCount,
        walletHistory,
      },
      "Wallet data fetched successfully"
    )
  );
});
