import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ProductView from "../../models/user/ProductView.model.js";
import Product from "../../models/admin/Product.model.js";
import User from "../../models/user/User.model.js";

// ─── PUBLIC: Record a product view ───────────────────────────────────────────
// @route POST /api/analytics/product-view
// Called by the storefront whenever a user opens a product detail page.
// Works for both logged-in users and guests (by session ID).
export const recordProductView = asyncHandler(async (req, res) => {
  const { productId, sessionId } = req.body;

  if (!productId) throw new ApiError(400, "productId is required");

  // Verify product exists (lightweight check — just the _id)
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) throw new ApiError(404, "Product not found");

  const userId = req.user?._id || null;

  // Avoid recording duplicate views within the last 30 minutes
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const filter = {
    product: productId,
    viewedAt: { $gte: thirtyMinAgo },
    ...(userId ? { user: userId } : { sessionId: sessionId || "" }),
  };

  const alreadyViewed = await ProductView.exists(filter);
  if (!alreadyViewed) {
    await ProductView.create({
      product: productId,
      user: userId,
      sessionId: userId ? "" : (sessionId || ""),
    });
  }

  res.status(200).json(new ApiResponse(200, null, "View recorded"));
});

// ─── ADMIN: Get all products with their view counts ──────────────────────────
// @route GET /api/admin/analytics/products
export const getProductsAnalytics = asyncHandler(async (req, res) => {
  // Aggregate view counts per product
  const viewCounts = await ProductView.aggregate([
    {
      $group: {
        _id: "$product",
        totalViews: { $sum: 1 },
        uniqueUsers: {
          $addToSet: { $cond: [{ $ifNull: ["$user", false] }, "$user", null] },
        },
      },
    },
    {
      $project: {
        totalViews: 1,
        uniqueLoggedInUsers: {
          $size: {
            $filter: {
              input: "$uniqueUsers",
              as: "u",
              cond: { $ne: ["$$u", null] },
            },
          },
        },
      },
    },
    { $sort: { totalViews: -1 } },
  ]);

  // Build a map productId -> stats
  const statsMap = {};
  viewCounts.forEach((v) => {
    statsMap[String(v._id)] = {
      totalViews: v.totalViews,
      uniqueLoggedInUsers: v.uniqueLoggedInUsers,
    };
  });

  // Fetch all active products (lightweight projection)
  const products = await Product.find({ isActive: true })
    .select("name brand images price category categorySlug")
    .sort({ createdAt: -1 });

  const result = products.map((p) => {
    const stats = statsMap[String(p._id)] || { totalViews: 0, uniqueLoggedInUsers: 0 };
    return {
      _id: p._id,
      name: p.name,
      brand: p.brand,
      image: p.images?.[0] || "",
      price: p.price,
      categorySlug: p.categorySlug,
      totalViews: stats.totalViews,
      uniqueLoggedInUsers: stats.uniqueLoggedInUsers,
    };
  });

  // Sort by views (most viewed first)
  result.sort((a, b) => b.totalViews - a.totalViews);

  res.status(200).json(new ApiResponse(200, { products: result }, "Products analytics fetched"));
});

// ─── ADMIN: Get users who viewed a specific product ──────────────────────────
// @route GET /api/admin/analytics/products/:productId/viewers
export const getProductViewers = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).select("name brand images price");
  if (!product) throw new ApiError(404, "Product not found");

  // Get all views for this product that have a logged-in user
  const views = await ProductView.find({
    product: productId,
    user: { $ne: null },
  })
    .sort({ viewedAt: -1 })
    .populate("user", "fullName email mobileNumber createdAt isActive");

  // Deduplicate by userId, keeping most recent view
  const seenUsers = new Set();
  const uniqueViews = [];
  for (const v of views) {
    if (!v.user) continue;
    const uid = String(v.user._id);
    if (!seenUsers.has(uid)) {
      seenUsers.add(uid);
      uniqueViews.push({
        userId: v.user._id,
        fullName: v.user.fullName,
        email: v.user.email,
        mobileNumber: v.user.mobileNumber || "—",
        lastViewedAt: v.viewedAt,
        isActive: v.user.isActive,
      });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { product: { _id: product._id, name: product.name, brand: product.brand, image: product.images?.[0] || "", price: product.price }, viewers: uniqueViews },
      "Product viewers fetched"
    )
  );
});
