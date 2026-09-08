import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";
import Order from "../../models/user/Order.model.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// @route GET /api/user/profile
export const getProfile = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments({ user: req.user._id });
  const user = req.user.toObject();
  res.status(200).json(new ApiResponse(200, { ...user, totalOrders }, "Profile fetched"));
});

// @route PUT /api/user/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, gender, dob, interests } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (fullName !== undefined) user.fullName = fullName;
  if (gender !== undefined) user.gender = gender;
  if (dob !== undefined) user.dob = dob;
  if (interests !== undefined) user.interests = interests;

  await user.save();
  res.status(200).json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

// @route PUT /api/user/profile/picture (multipart, field name: "image")
export const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file uploaded");

  const result = await uploadToCloudinary(req.file.path, "hashtelicom/users");

  const user = await User.findById(req.user._id);
  user.profilePicture = result.secure_url;
  await user.save();

  res.status(200).json(new ApiResponse(200, { profilePicture: user.profilePicture }, "Profile picture updated"));
});

// @route PUT /api/user/profile/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, "currentPassword and newPassword are required");

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});
