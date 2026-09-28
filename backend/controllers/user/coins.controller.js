import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import User from "../../models/user/User.model.js";

// @route GET /api/user/coins
// Returns user's current She Points balance and full coin history
export const getMyCoins = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("shePoints coinsHistory");
  if (!user) throw new ApiError(404, "User not found");

  const coinsHistory = (user.coinsHistory || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        shePoints: user.shePoints || 0,
        coinsHistory,
      },
      "Coins data fetched successfully"
    )
  );
});
