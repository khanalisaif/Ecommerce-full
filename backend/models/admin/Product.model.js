import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true }, // stored upper-case, e.g. ZIVAME
    brandName: { type: String, default: "" }, // proper-case, e.g. Zivame
    description: { type: String, default: "" },
    sku: { type: String, default: "" },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categorySlug: { type: String, required: true }, // denormalized for fast storefront filtering

    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: String, default: "" }, // e.g. "35% OFF" (auto-computed if not provided)

    images: [{ type: String }], // Cloudinary URLs, first = primary thumbnail

    colors: [{ type: mongoose.Schema.Types.Mixed }], // string, or rich { name, hex, image, images, stock }
    sizes: [{ type: String }],

    stock: { type: Number, default: 0 },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },

    isAssured: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    badge: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("stockInfo").get(function () {
  return this.stock > 0 ? "In Stock" : "Out of Stock";
});

productSchema.pre("save", function (next) {
  if (this.originalPrice > 0 && this.price >= 0 && !this.discount) {
    const pct = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    if (pct > 0) this.discount = `${pct}% OFF`;
  }
  if (!this.sku) {
    this.sku = `HTL-${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

productSchema.set("toJSON", { virtuals: true });
productSchema.index({ name: "text", brand: "text", brandName: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
