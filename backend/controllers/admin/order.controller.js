import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Order from "../../models/user/Order.model.js";
import User from "../../models/user/User.model.js";
import Product from "../../models/admin/Product.model.js";
import { sendOrderStatusUpdateEmail, sendReviewReminderEmail } from "../../utils/sendEmail.js";

// @route GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "fullName email mobileNumber").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }, "Orders fetched")
  );
});

// @route GET /api/admin/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "fullName email mobileNumber");
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, { order }, "Order fetched"));
});

// @route PUT /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(", ")}`);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const oldStatus = order.status;
  order.status = status;
  order.statusHistory.push({ status, timestamp: new Date() });
  await order.save();

  // Trigger emails if status actually changed
  if (oldStatus !== status) {
    const userId = order.user?._id || order.user;
    const user = userId ? await User.findById(userId).select("fullName email") : null;
    const recipientEmail = user?.email || order.shippingAddress?.email;
    const customerName = user?.fullName || order.shippingAddress?.fullName || "Customer";

    if (recipientEmail) {
      // 1. Order Status Update Email — sent immediately on any status change
      sendOrderStatusUpdateEmail(recipientEmail, {
        userName: customerName,
        orderId: order.orderId,
        status,
        total: order.total,
        items: order.items,
      })
        .then(() => console.log(`📧 [ORDER STATUS EMAIL] Dispatched "${status}" email to ${recipientEmail} for order #${order.orderId}`))
        .catch((err) => console.error(`❌ [ORDER STATUS EMAIL ERROR] Failed to send "${status}" email to ${recipientEmail}:`, err.message));

      // 2. Review Reminder Email — triggered immediately when status becomes Delivered
      if (status === "Delivered") {
        sendReviewReminderEmail(recipientEmail, {
          userName: customerName,
          orderId: order.orderId,
          items: order.items,
        })
          .then(() => console.log(`⭐ [REVIEW REMINDER EMAIL] Dispatched review reminder to ${recipientEmail} for order #${order.orderId}`))
          .catch((err) => console.error(`❌ [REVIEW REMINDER EMAIL ERROR] Failed to send review reminder to ${recipientEmail}:`, err.message));
      }
    } else {
      console.warn(`⚠️ [ORDER STATUS] No recipient email found for order #${order.orderId}`);
    }

    // Restore stock if order was cancelled
    if (oldStatus !== "Cancelled" && status === "Cancelled") {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }
  }

  res.status(200).json(new ApiResponse(200, { order }, "Order status updated"));
});

// @route PUT /api/admin/orders/:id/payment-status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const allowed = ["pending", "paid", "failed", "refunded"];
  if (!allowed.includes(paymentStatus)) throw new ApiError(400, `paymentStatus must be one of: ${allowed.join(", ")}`);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.paymentStatus = paymentStatus;
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, "Payment status updated"));
});

// @route DELETE /api/admin/orders/:id
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Order deleted successfully"));
});
