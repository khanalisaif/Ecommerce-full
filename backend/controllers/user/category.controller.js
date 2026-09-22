import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Category from "../../models/admin/Category.model.js";

const toClient = (c) => {
  const obj = c.toObject ? c.toObject() : c;
  return {
    id: String(obj._id),
    name: obj.name,
    slug: obj.slug,
    icon: obj.icon || "Package",
    image: obj.image || "",
    displayOrder: obj.displayOrder ?? 0,
    subcategories: (obj.subcategories || []).map((s) => ({
      id: String(s._id || s.id),
      _id: String(s._id || s.id),
      name: s.name,
      slug: s.slug,
    })),
  };
};

// @route GET /api/user/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json(new ApiResponse(200, { categories: categories.map(toClient) }, "Categories fetched"));
});
