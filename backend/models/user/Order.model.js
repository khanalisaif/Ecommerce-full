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

    paymentMethod: { type: String, enum: ["upi", "card", "netbanking", "wallet", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },

    deliveryOption: { type: String, enum: ["standard", "express"], default: "standard" },
    orderNotes: { type: String, default: "" },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [statusHistorySchema],
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
