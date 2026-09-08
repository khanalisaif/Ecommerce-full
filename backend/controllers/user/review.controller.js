import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Review from "../../models/user/Review.model.js";
import Product from "../../models/admin/Product.model.js";

// Recomputes and stores a product's aggregate rating/review count.
const recomputeProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 4.5, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
    reviews: count,
  });
};

const toClient = (r) => ({
  id: r._id,
  product: r.product?._id || r.product,
  productName: r.product?.name,
  productImage: r.product?.images?.[0] || "",
  productBrand: r.product?.brandName || r.product?.brand || "",
  user: r.user?._id || r.user,
  userName: r.user?.fullName || "You",
  rating: r.rating,
  title: r.title,
  body: r.body,
  images: r.images || [],
  helpful: r.helpfulCount,
  date: new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
});

// @route GET /api/user/products/:productId/reviews  (public)
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "fullName")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { reviews: reviews.map(toClient) }, "Reviews fetched"));
});

// @route POST /api/user/products/:productId/reviews  (auth)
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, body, images } = req.body;
  if (!rating || !body) throw new ApiError(400, "rating and body are required");

  const product = await Product.findById(req.params.productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = await Review.findOne({ product: product._id, user: req.user._id });
  if (existing) throw new ApiError(409, "You have already reviewed this product. Please edit your existing review instead.");

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    rating: Number(rating),
    title: title || "",
    body,
    images: Array.isArray(images) ? images : [],
  });

  await recomputeProductRating(product._id);

  const populated = await review.populate("user", "fullName");
  res.status(201).json(new ApiResponse(201, { review: toClient(populated) }, "Review submitted successfully"));
});

// @route GET /api/user/reviews  (auth — "my reviews" across all products)
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "name images brand brandName")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { reviews: reviews.map(toClient) }, "My reviews fetched"));
});

// @route PUT /api/user/reviews/:id  (auth, owner only)
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, "Review not found");

  const { rating, title, body } = req.body;
  if (rating !== undefined) review.rating = Number(rating);
  if (title !== undefined) review.title = title;
  if (body !== undefined) review.body = body;

  await review.save();
  await recomputeProductRating(review.product);

  const populated = await review.populate([{ path: "user", select: "fullName" }, { path: "product", select: "name images brand brandName" }]);
  res.status(200).json(new ApiResponse(200, { review: toClient(populated) }, "Review updated"));
});

// @route DELETE /api/user/reviews/:id  (auth, owner only)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, "Review not found");

  const productId = review.product;
  await review.deleteOne();
  await recomputeProductRating(productId);

  res.status(200).json(new ApiResponse(200, null, "Review deleted"));
});

// @route POST /api/user/reviews/:id/helpful  (auth)
export const markReviewHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.helpfulUsers.some((u) => u.toString() === req.user._id.toString())) {
    throw new ApiError(409, "You've already marked this review as helpful");
  }

  review.helpfulUsers.push(req.user._id);
  review.helpfulCount += 1;
  await review.save();

  res.status(200).json(new ApiResponse(200, { helpful: review.helpfulCount }, "Marked as helpful"));
});
