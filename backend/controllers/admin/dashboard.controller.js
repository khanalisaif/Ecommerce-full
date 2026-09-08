import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Order from "../../models/user/Order.model.js";
import User from "../../models/user/User.model.js";
import Product from "../../models/admin/Product.model.js";

// @route GET /api/admin/dashboard/overview
export const getOverview = asyncHandler(async (req, res) => {
  const [totalOrders, totalCustomers, totalProducts, pendingOrders, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ email: { $exists: true, $ne: null } }),
    Product.countDocuments(),
    Order.countDocuments({ status: "Pending" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const recentOrders = await Order.find().populate("user", "fullName email").sort({ createdAt: -1 }).limit(5);

  res.status(200).json(
    new ApiResponse(200, {
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentOrders,
    }, "Dashboard overview fetched")
  );
});

// @route GET /api/admin/dashboard/inventory
export const getInventoryOverview = asyncHandler(async (req, res) => {
  const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 }, isActive: true }).select("name stock brand");
  const outOfStock = await Product.find({ stock: 0, isActive: true }).select("name brand");

  res.status(200).json(new ApiResponse(200, { lowStock, outOfStock }, "Inventory overview fetched"));
});
