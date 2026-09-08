import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";
import Product from "../../models/admin/Product.model.js";

// @route GET /api/user/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.status(200).json(new ApiResponse(200, { wishlist: user.wishlist }, "Wishlist fetched"));
});

// @route POST /api/user/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  res.status(200).json(new ApiResponse(200, { wishlistCount: user.wishlist.length }, "Added to wishlist"));
});

// @route DELETE /api/user/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  res.status(200).json(new ApiResponse(200, { wishlistCount: user.wishlist.length }, "Removed from wishlist"));
});
