import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Order from "../../models/user/Order.model.js";
import User from "../../models/user/User.model.js";
import Product from "../../models/admin/Product.model.js";
import { sendOrderStatusUpdateEmail, sendReviewReminderEmail } from "../../utils/sendEmail.js";
import {
  createShipment,
  schedulePickup,
  generateLabel,
  cancelShipment,
  trackPackage,
  DELHIVERY_PUBLIC_TRACK_URL,
  formatDelhiveryError,
} from "../../utils/delhivery.js";

// ── helper: build Delhivery order payload from our Order doc ─────────────────
async function buildShipmentData(order) {
  const addr = order.shippingAddress || {};

  // Pick first item's product details for weight/dimensions
  const firstProductId = order.items?.[0]?.product;
  let weight = 0.05, length = 10, width = 10, height = 5, shippingMode = "Surface";
  if (firstProductId) {
    const prod = await Product.findById(firstProductId).select("weight length width height shippingMode").lean();
    if (prod) {
      weight       = prod.weight       || weight;
      length       = prod.length       || length;
      width        = prod.width        || width;
      height       = prod.height       || height;
      shippingMode = prod.shippingMode || shippingMode;
    }
  }

  const paymentMode = order.paymentMethod === "cod" ? "COD" : "Prepaid";
  const productName = order.items?.map((i) => i.name).join(", ").slice(0, 80) || "Product";

  return {
    name:         addr.fullName   || "Customer",
    address:      [addr.addressLine, addr.landmark].filter(Boolean).join(", "),
    pincode:      addr.pincode    || "",
    city:         addr.city       || "",
    state:        addr.state      || "",
    country:      "India",
    phone:        addr.mobile     || "",
    orderId:      order.orderId,
    paymentMode,
    weight:       String(weight),
    length:       String(length),
    width:        String(width),
    height:       String(height),
    productName,
    totalAmount:  String(order.total || 0),
    shippingMode,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Standard CRUD
// ═══════════════════════════════════════════════════════════════════════════════

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

  if (oldStatus !== status) {
    const userId = order.user?._id || order.user;
    const user = userId ? await User.findById(userId).select("fullName email") : null;
    const recipientEmail = user?.email || order.shippingAddress?.email;
    const customerName = user?.fullName || order.shippingAddress?.fullName || "Customer";

    if (recipientEmail) {
      sendOrderStatusUpdateEmail(recipientEmail, {
        userName: customerName,
        orderId: order.orderId,
        status,
        total: order.total,
        items: order.items,
      }).catch((err) => console.error("Order status email failed:", err.message));

      if (status === "Delivered") {
        sendReviewReminderEmail(recipientEmail, {
          userName: customerName,
          orderId: order.orderId,
          items: order.items,
        }).catch((err) => console.error("Review reminder email failed:", err.message));
      }
    }

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


// ═══════════════════════════════════════════════════════════════════════════════
// Delhivery Actions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/admin/orders/:id/delhivery/confirm
 * @desc    Create shipment on Delhivery & get waybill/AWB number
 *          Moves order → Processing
 */
export const confirmOrderWithDelhivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.delhivery?.waybill) {
    throw new ApiError(400, `Shipment already created. AWB: ${order.delhivery.waybill}`);
  }

  const shipmentData = await buildShipmentData(order);
  let delRes;
  try {
    delRes = await createShipment(shipmentData);
  } catch (err) {
    throw new ApiError(400, `Delhivery API error: ${formatDelhiveryError(err)}`);
  }

  // Delhivery returns packages[] array
  const pkg = delRes?.packages?.[0];
  if (!pkg || !pkg.waybill) {
    throw new ApiError(502, `Delhivery did not return a waybill. Response: ${JSON.stringify(delRes)}`);
  }

  order.delhivery.waybill           = pkg.waybill;
  order.delhivery.sortCode          = pkg.sort_code || "";
  order.delhivery.shipmentCreatedAt = new Date();

  if (order.status === "Pending") {
    order.status = "Processing";
    order.statusHistory.push({ status: "Processing", timestamp: new Date() });
  }
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { order, waybill: pkg.waybill, delhivery: delRes }, "Shipment created on Delhivery")
  );
});

/**
 * @route   POST /api/admin/orders/:id/delhivery/resend
 * @desc    Re-create shipment on Delhivery (e.g. after cancellation & reinstatement)
 */
export const resendToDelhivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status === "Cancelled") throw new ApiError(400, "Cannot resend a cancelled order");

  const shipmentData = await buildShipmentData(order);
  let delRes;
  try {
    delRes = await createShipment(shipmentData);
  } catch (err) {
    throw new ApiError(400, `Delhivery API error: ${formatDelhiveryError(err)}`);
  }

  const pkg = delRes?.packages?.[0];
  if (!pkg || !pkg.waybill) {
    throw new ApiError(502, `Delhivery did not return a waybill. Response: ${JSON.stringify(delRes)}`);
  }

  order.delhivery.waybill           = pkg.waybill;
  order.delhivery.sortCode          = pkg.sort_code || "";
  order.delhivery.shipmentCreatedAt = new Date();
  order.delhivery.cancelled         = false;
  order.delhivery.labelFetched      = false;
  order.delhivery.labelUrl          = "";
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { order, waybill: pkg.waybill }, "Shipment re-created on Delhivery")
  );
});

/**
 * @route   POST /api/admin/orders/delhivery/schedule-pickup
 * @desc    Schedule bulk pickup with Delhivery
 *          Body: { pickupDate, pickupTime, packageCount }
 */
export const scheduleDelhiveryPickup = asyncHandler(async (req, res) => {
  const { pickupDate, pickupTime, packageCount } = req.body;

  let delRes;
  try {
    delRes = await schedulePickup({ pickupDate, pickupTime, packageCount });
  } catch (err) {
    throw new ApiError(400, `Delhivery pickup error: ${formatDelhiveryError(err)}`);
  }

  // If orderIds were provided, stamp them with pickupId
  const pickupId = delRes?.pickup_id || delRes?.id || "";
  if (req.body.orderIds?.length && pickupId) {
    await Order.updateMany(
      { _id: { $in: req.body.orderIds } },
      {
        $set: {
          "delhivery.pickupId":          pickupId,
          "delhivery.pickupScheduledAt": new Date(),
        },
      }
    );
  }

  res.status(200).json(
    new ApiResponse(200, { pickupId, delhivery: delRes }, "Pickup scheduled with Delhivery")
  );
});

/**
 * @route   GET /api/admin/orders/:id/delhivery/label
 * @desc    Fetch shipping label PDF URL from Delhivery for this order
 */
export const getDelhiveryLabel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const waybill = order.delhivery?.waybill;
  if (!waybill) throw new ApiError(400, "No Delhivery waybill found. Please confirm the order on Delhivery first.");

  let delRes;
  try {
    delRes = await generateLabel(waybill);
  } catch (err) {
    throw new ApiError(400, `Delhivery label error: ${formatDelhiveryError(err)}`);
  }

  const labelUrl = delRes?.packages?.[0]?.pdf_download_link || "";

  // Cache on order doc
  order.delhivery.labelUrl     = labelUrl;
  order.delhivery.labelFetched = true;
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { labelUrl, waybill, delhivery: delRes }, "Shipping label fetched")
  );
});

/**
 * @route   POST /api/admin/orders/:id/delhivery/cancel
 * @desc    Cancel the Delhivery shipment AND mark order Cancelled
 */
export const cancelOrderOnDelhivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const waybill = order.delhivery?.waybill;

  // Cancel on Delhivery if waybill exists
  let delRes = null;
  if (waybill) {
    try {
      delRes = await cancelShipment(waybill);
    } catch (err) {
      // Log but don't fail — still cancel locally
      console.error("Delhivery cancel API error:", formatDelhiveryError(err));
    }
  }

  // Mark cancelled in our DB
  const oldStatus = order.status;
  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", timestamp: new Date() });
  order.delhivery.cancelled = true;
  await order.save();

  // Restore inventory
  if (oldStatus !== "Cancelled") {
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }
  }

  res.status(200).json(
    new ApiResponse(200, { order, delhivery: delRes }, "Order cancelled on Delhivery")
  );
});

/**
 * @route   GET /api/admin/orders/:id/delhivery/track
 * @desc    Get live tracking from Delhivery for this order (admin — includes full scans)
 */
export const trackDelhiveryOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const waybill = order.delhivery?.waybill;
  if (!waybill) throw new ApiError(400, "No Delhivery waybill found for this order.");

  let delRes;
  try {
    delRes = await trackPackage(waybill);
  } catch (err) {
    throw new ApiError(400, `Delhivery tracking error: ${formatDelhiveryError(err)}`);
  }

  // Parse tracking data
  const shipData  = delRes?.ShipmentData?.[0]?.Shipment || {};
  const scans     = shipData?.Scans || [];
  const delStatus = shipData?.Status?.Status || "";

  // Persist last-known tracking data
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
      raw:            delRes,
    }, "Tracking data fetched")
  );
});
