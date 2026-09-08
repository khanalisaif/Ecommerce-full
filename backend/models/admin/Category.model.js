import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: "Package" }, // lucide-react icon name
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },

    // Filter config shown on the category listing sidebar (frontend CATEGORY_CONFIG)
    title: { type: String, default: "" },
    brands: [{ type: String }],
    colors: [{ type: String }],
    sizes: [{ label: String, count: { type: Number, default: 0 } }],
    discounts: [{ type: String }],
    ratings: [{ type: String }],
    sidebarCategories: [
      {
        name: String,
        sub: [{ name: String, count: { type: Number, default: 0 } }],
      },
    ],
  },
  { timestamps: true }
);

categorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { strict: true, lower: false });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
