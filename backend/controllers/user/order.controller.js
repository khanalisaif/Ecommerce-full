import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Order from "../../models/user/Order.model.js";
import Cart from "../../models/user/Cart.model.js";
import Product from "../../models/admin/Product.model.js";
import User from "../../models/user/User.model.js";
import { sendOrderConfirmationEmail, sendNewOrderAlert } from "../../utils/sendEmail.js";
import { cancelShipment, trackPackage, DELHIVERY_PUBLIC_TRACK_URL } from "../../utils/delhivery.js";

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
    razorpayOrderId = "",
    razorpayPaymentId = "",
    razorpaySignature = "",
    useCoins = false,
    useWallet = false,
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

  // She Points / Super Coins calculation
  const coinsEarned = cart.items.reduce(
    (sum, i) => sum + (Number(i.product?.coinsReward) || 0) * i.quantity,
    0
  );

  let coinsUsed = 0;
  let coinsDiscount = 0;
  if (useCoins) {
    const netCartAmount = Math.max(0, subtotal - appliedCouponDiscount);
    // User can redeem max 10% of total cart amount (1 coin = ₹1)
    const maxAllowedCoins = Math.floor(netCartAmount * 0.10);
    const availableCoins = Math.max(0, user.shePoints || 0);
    coinsUsed = Math.min(availableCoins, maxAllowedCoins);
    coinsDiscount = coinsUsed * 1;
  }

  let shippingCost = subtotal === 0 ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING);
  if (deliveryOption === "express") shippingCost += 79;

  const totalBeforeWallet = Math.max(0, subtotal - appliedCouponDiscount - coinsDiscount + shippingCost);

  let walletUsed = 0;
  if (useWallet) {
    const availableWallet = Math.max(0, user.walletBalance || 0);
    walletUsed = Math.min(availableWallet, totalBeforeWallet);
  }

  const total = Math.max(0, totalBeforeWallet - walletUsed);
  const effectivePaymentMethod = total === 0 ? "wallet" : paymentMethod.toLowerCase();
  const effectivePaymentStatus = total === 0 ? "paid" : (paymentMethod.toLowerCase() === "cod" ? "pending" : "paid");

  const orderId = generateOrderId();
  const order = await Order.create({
    orderId,
    user: req.user._id,
    items,
    shippingAddress: {
      fullName:    address.fullName,
      mobile:      address.mobile,
      pincode:     address.pincode,
      addressLine: address.addressLine,
      landmark:    address.landmark,
      city:        address.city,
      state:       address.state,
    },
    paymentMethod:      effectivePaymentMethod,
    paymentStatus:      effectivePaymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    deliveryOption,
    orderNotes,
    subtotal,
    discount,
    couponCode:      couponCode ? couponCode.trim().toUpperCase() : "",
    couponDiscount:  appliedCouponDiscount,
    coinsUsed,
    coinsDiscount,
    coinsEarned,
    coinsCredited: false,
    walletUsed,
    shippingCost,
    total,
  });

  // If coins were used, deduct them from user's balance and record in history
  if (coinsUsed > 0) {
    user.shePoints = Math.max(0, (user.shePoints || 0) - coinsUsed);
    user.coinsHistory.push({
      type: "redeemed",
      amount: coinsUsed,
      description: `Redeemed on order ${orderId}`,
      orderId,
      createdAt: new Date(),
    });
    await user.save();
  }

  // If wallet balance was used, deduct from user's wallet and record in history
  if (walletUsed > 0) {
    user.walletBalance = Math.max(0, (user.walletBalance || 0) - walletUsed);
    user.walletHistory.push({
      type: "debit",
      amount: walletUsed,
      description: `Used on order ${orderId}`,
      orderId,
      createdAt: new Date(),
    });
    await user.save();
  }

  // Decrement stock
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

  // Cancel on Delhivery if waybill exists (best-effort)
  const waybill = order.delhivery?.waybill;
  if (waybill) {
    try {
      await cancelShipment(waybill);
      order.delhivery.cancelled = true;
    } catch (err) {
      console.error("Delhivery cancel failed (user-initiated):", err?.response?.data || err.message);
    }
  }

  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", timestamp: new Date() });
  await order.save();

  // Restore inventory
  for (const item of order.items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  // Refund any redeemed coins if cancelled
  if (order.coinsUsed > 0 && !order.coinsRefunded) {
    order.coinsRefunded = true;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { shePoints: order.coinsUsed },
      $push: {
        coinsHistory: {
          type: "refunded",
          amount: order.coinsUsed,
          description: `Refunded coins from cancelled order ${order.orderId}`,
          orderId: order.orderId,
          createdAt: new Date(),
        },
      },
    });
  }

  // Refund any wallet balance used
  if (order.walletUsed > 0 && !order.walletRefunded) {
    order.walletRefunded = true;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { walletBalance: order.walletUsed },
      $push: {
        walletHistory: {
          type: "credit",
          amount: order.walletUsed,
          description: `Refunded wallet balance from cancelled order ${order.orderId}`,
          orderId: order.orderId,
          createdAt: new Date(),
        },
      },
    });
  }

  if (order.paymentMethod === 'wallet' && order.paymentStatus === 'paid') {
    order.paymentStatus = 'refunded';
  }

  await order.save();

  let refundDetails = [];
  if (order.walletUsed > 0) refundDetails.push(`₹${order.walletUsed} Wallet Money`);
  if (order.coinsUsed > 0) refundDetails.push(`${order.coinsUsed} She Coins`);
  const refundMsg = refundDetails.length > 0
    ? `Order cancelled. ${refundDetails.join(' & ')} refunded to your account!`
    : "Order cancelled successfully.";

  res.status(200).json(
    new ApiResponse(
      200,
      { order, refundedCoins: order.coinsUsed, refundedWallet: order.walletUsed },
      refundMsg
    )
  );
});

/**
 * @route GET /api/user/orders/:orderId/track
 * @desc  Live Delhivery tracking for the authenticated user's order
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  const waybill = order.delhivery?.waybill;
  if (!waybill) {
    // Return our own status history if no Delhivery waybill yet
    return res.status(200).json(
      new ApiResponse(200, {
        waybill:        null,
        publicTrackUrl: null,
        status:         order.status,
        scans:          [],
        statusHistory:  order.statusHistory,
        message:        "Shipment not yet handed to Delhivery",
      }, "Order status from internal records")
    );
  }

  let delRes;
  try {
    delRes = await trackPackage(waybill);
  } catch (err) {
    // Fallback to cached data
    return res.status(200).json(
      new ApiResponse(200, {
        waybill,
        publicTrackUrl:  `${DELHIVERY_PUBLIC_TRACK_URL}/${waybill}`,
        status:          order.delhivery?.delhiveryStatus || order.status,
        scans:           order.delhivery?.trackingScans   || [],
        statusHistory:   order.statusHistory,
        cached:          true,
      }, "Tracking data (cached)")
    );
  }

  const shipData  = delRes?.ShipmentData?.[0]?.Shipment || {};
  const scans     = shipData?.Scans  || [];
  const delStatus = shipData?.Status?.Status || "";

  // Update cache
  order.delhivery.delhiveryStatus   = delStatus;
  order.delhivery.trackingScans     = scans;
  order.delhivery.trackingFetchedAt = new Date();
  await order.save();

  res.status(200).json(
    new ApiResponse(200, {
      waybill,
      publicTrackUrl: `${DELHIVERY_PUBLIC_TRACK_URL}/${waybill}`,
      status:         delStatus,
      scans,
      statusHistory:  order.statusHistory,
    }, "Tracking data fetched")
  );
});
