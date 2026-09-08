import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";

// @route GET /api/user/preferences
export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, { preferences: user.preferences }, "Preferences fetched"));
});

// @route PUT /api/user/preferences
// Body: { privacy?: {...partial}, notifications?: {...partial} }
export const updatePreferences = asyncHandler(async (req, res) => {
  const { privacy, notifications } = req.body;
  const user = await User.findById(req.user._id);

  if (privacy) {
    user.preferences.privacy = { ...(user.preferences.privacy?.toObject?.() || user.preferences.privacy || {}), ...privacy };
  }
  if (notifications) {
    user.preferences.notifications = { ...(user.preferences.notifications?.toObject?.() || user.preferences.notifications || {}), ...notifications };
  }

  await user.save();
  res.status(200).json(new ApiResponse(200, { preferences: user.preferences }, "Preferences updated"));
});
