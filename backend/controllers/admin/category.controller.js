import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Category from "../../models/admin/Category.model.js";
import { resolveImage } from "../../config/cloudinary.js";

const toClient = (c) => {
  const obj = c.toObject ? c.toObject() : c;
  return { id: String(obj._id), name: obj.name, slug: obj.slug, icon: obj.icon || "Package", image: obj.image || "" };
};

// @route GET /api/admin/categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json(new ApiResponse(200, { categories: categories.map(toClient) }, "Categories fetched"));
});

// @route POST /api/admin/categories (JSON body: { name, icon, image })
export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, image } = req.body;
  if (!name) throw new ApiError(400, "name is required");

  const resolvedImage = await resolveImage(image, "hashtelicom/categories");

  const category = await Category.create({ name, icon: icon || "Package", image: resolvedImage });
  res.status(201).json(new ApiResponse(201, { category: toClient(category) }, "Category created successfully"));
});

// @route PUT /api/admin/categories/:id (JSON body)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, icon, image } = req.body;
  if (name !== undefined) category.name = name;
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = await resolveImage(image, "hashtelicom/categories");

  await category.save();
  res.status(200).json(new ApiResponse(200, { category: toClient(category) }, "Category updated successfully"));
});

// @route DELETE /api/admin/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  await category.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});
