import mongoose from "mongoose";

// Tracks which user viewed which product's detail page
const productViewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = guest
    sessionId: { type: String, default: "" }, // for guest dedup
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for fast lookups: views per product, views per user
productViewSchema.index({ product: 1, viewedAt: -1 });
productViewSchema.index({ product: 1, user: 1 });

const ProductView = mongoose.model("ProductView", productViewSchema);
export default ProductView;
