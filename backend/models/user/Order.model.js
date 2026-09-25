import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // human-readable, e.g. HTL-000123
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      mobile: String,
      pincode: String,
      addressLine: String,
      landmark: String,
      city: String,
      state: String,
    },

    paymentMethod: { type: String, enum: ["upi", "card", "netbanking", "wallet", "online", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    deliveryOption: { type: String, enum: ["standard", "express"], default: "standard" },
    orderNotes: { type: String, default: "" },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [statusHistorySchema],

    // ── Delhivery shipment lifecycle ──────────────────────────────────────────
    delhivery: {
      // waybill = AWB number assigned by Delhivery when shipment is created
      waybill:        { type: String, default: "" },
      // sort_code returned by Delhivery (e.g. "NDLH-DEL")
      sortCode:       { type: String, default: "" },
      // When shipment was booked on Delhivery
      shipmentCreatedAt: { type: Date },
      // PDF URL of the packing slip / shipping label
      labelUrl:       { type: String, default: "" },
      // Whether label has been fetched from Delhivery
      labelFetched:   { type: Boolean, default: false },
      // Pickup request ID from First Mile API
      pickupId:       { type: String, default: "" },
      pickupScheduledAt: { type: Date },
      // Current status as last seen from Delhivery tracking API
      delhiveryStatus: { type: String, default: "" },
      // Full tracking scans (last fetched)
      trackingScans:  { type: Array, default: [] },
      trackingFetchedAt: { type: Date },
      // Was the shipment cancelled on Delhivery?
      cancelled:      { type: Boolean, default: false },
    },
    // ──────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

orderSchema.pre("validate", function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: "Pending", timestamp: new Date() });
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
