import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Order from "../../models/user/Order.model.js";
import Cart from "../../models/user/Cart.model.js";
import Product from "../../models/admin/Product.model.js";
import User from "../../models/user/User.model.js";
import { sendOrderConfirmationEmail, sendNewOrderAlert } from "../../utils/sendEmail.js";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 200;

const generateOrderId = () => `HTL-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

// @route POST /api/user/orders (checkout)
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    addressId,
    paymentMethod,
    deliveryOption = "standard",
    orderNotes = "",
    couponCode = "",
    couponDiscount = 0,
  } = req.body;
  if (!addressId || !paymentMethod) throw new ApiError(400, "addressId and paymentMethod are required");

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, "Selected address not found");

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.images?.[0] || "",
    price: i.priceAtAdd,
    quantity: i.quantity,
    size: i.size,
    color: i.color,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const originalTotal = cart.items.reduce(
    (sum, i) => sum + (i.product.originalPrice || i.priceAtAdd) * i.quantity,
    0
  );
  const discount = Math.max(0, originalTotal - subtotal);
  const appliedCouponDiscount = Math.max(0, Number(couponDiscount) || 0);

  let shippingCost = deliveryOption === "express" ? 150 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  if (deliveryOption === "express") shippingCost += subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

  const total = Math.max(0, subtotal - discount - appliedCouponDiscount + shippingCost);

  const order = await Order.create({
    orderId: generateOrderId(),
    user: req.user._id,
    items,
    shippingAddress: {
      fullName: address.fullName,
      mobile: address.mobile,
      pincode: address.pincode,
      addressLine: address.addressLine,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
    },
    paymentMethod: paymentMethod.toLowerCase(),
    paymentStatus: paymentMethod.toLowerCase() === "cod" ? "pending" : "paid",
    deliveryOption,
    orderNotes,
    subtotal,
    discount,
    couponCode: couponCode ? couponCode.trim().toUpperCase() : "",
    couponDiscount: appliedCouponDiscount,
    shippingCost,
    total,
  });

  // Decrement stock (best-effort; not fully transactional but fine for this scale)
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product) continue;
    product.stock = Math.max(0, (product.stock || 0) - item.quantity);
    await product.save();
  }

  // Increment coupon usage count if applied
  if (couponCode) {
    import("../../models/admin/Coupon.model.js")
      .then(({ default: Coupon }) =>
        Coupon.findOneAndUpdate({ code: couponCode.trim().toUpperCase() }, { $inc: { usedCount: 1 } })
      )
      .catch((err) => console.error("Coupon usage update failed:", err.message));
  }

  cart.items = [];
  await cart.save();

  // Send Order Confirmation email if user hasn't opted out of order updates
  if (user.preferences?.notifications?.orders !== false) {
    sendOrderConfirmationEmail(user.email, order).catch(() => {});
  }
  sendNewOrderAlert(order).catch((err) => console.error("New order admin alert failed:", err.message));

  res.status(201).json(new ApiResponse(201, { order }, "Order placed successfully"));
});

// @route GET /api/user/orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { orders }, "Orders fetched"));
});

// @route GET /api/user/orders/:orderId
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, { order }, "Order fetched"));
});

// @route PUT /api/user/orders/:orderId/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
    throw new ApiError(400, `Order cannot be cancelled once it is ${order.status}`);
  }

  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", timestamp: new Date() });
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, "Order cancelled"));
});
