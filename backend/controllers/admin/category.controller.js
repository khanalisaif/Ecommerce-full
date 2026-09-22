import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Category from "../../models/admin/Category.model.js";
import { resolveImage } from "../../config/cloudinary.js";
import slugify from "slugify";

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

// @route GET /api/admin/categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json(new ApiResponse(200, { categories: categories.map(toClient) }, "Categories fetched"));
});

// @route POST /api/admin/categories (JSON body: { name, icon, image, subcategories })
export const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, image, subcategories } = req.body;
  if (!name) throw new ApiError(400, "name is required");

  const resolvedImage = await resolveImage(image, "hashtelicom/categories");

  let formattedSubs = [];
  if (Array.isArray(subcategories)) {
    formattedSubs = subcategories
      .map((s) => {
        const subName = typeof s === "string" ? s.trim() : s?.name?.trim();
        if (!subName) return null;
        const subSlug = (typeof s === "object" && s.slug) ? s.slug : slugify(subName, { strict: true, lower: true });
        return { name: subName, slug: subSlug };
      })
      .filter(Boolean);
  }

  const lastCategory = await Category.findOne().sort({ displayOrder: -1 }).select("displayOrder");
  const nextOrder = lastCategory && typeof lastCategory.displayOrder === "number" ? lastCategory.displayOrder + 1 : 0;
  const category = await Category.create({
    name,
    icon: icon || "Package",
    image: resolvedImage,
    displayOrder: nextOrder,
    subcategories: formattedSubs,
  });
  res.status(201).json(new ApiResponse(201, { category: toClient(category) }, "Category created successfully"));
});

// @route PUT /api/admin/categories/:id (JSON body)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, icon, image, subcategories } = req.body;
  if (name !== undefined) category.name = name;
  if (icon !== undefined) category.icon = icon;
  if (image !== undefined) category.image = await resolveImage(image, "hashtelicom/categories");
  if (Array.isArray(subcategories)) {
    category.subcategories = subcategories
      .map((s) => {
        const subName = typeof s === "string" ? s.trim() : s?.name?.trim();
        if (!subName) return null;
        const subSlug = (typeof s === "object" && s.slug) ? s.slug : slugify(subName, { strict: true, lower: true });
        return {
          ...(s._id ? { _id: s._id } : s.id ? { _id: s.id } : {}),
          name: subName,
          slug: subSlug,
        };
      })
      .filter(Boolean);
  }

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

// @route POST /api/admin/categories/:id/subcategories
export const addSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, slug } = req.body;
  if (!name || !name.trim()) throw new ApiError(400, "Subcategory name is required");

  const subName = name.trim();
  const subSlug = slug ? slug.trim() : slugify(subName, { strict: true, lower: true });

  const exists = category.subcategories.some(
    (s) => s.slug === subSlug || s.name.toLowerCase() === subName.toLowerCase()
  );
  if (exists) {
    throw new ApiError(400, "Subcategory with this name already exists in this category");
  }

  category.subcategories.push({ name: subName, slug: subSlug });
  await category.save();

  res.status(201).json(new ApiResponse(201, { category: toClient(category) }, "Subcategory added successfully"));
});

// @route PUT /api/admin/categories/:id/subcategories/:subId
export const updateSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const sub = category.subcategories.id(req.params.subId);
  if (!sub) throw new ApiError(404, "Subcategory not found");

  const { name, slug } = req.body;
  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Subcategory name cannot be empty");
    sub.name = name.trim();
    sub.slug = slug ? slug.trim() : slugify(sub.name, { strict: true, lower: true });
  } else if (slug !== undefined) {
    sub.slug = slug.trim();
  }

  await category.save();
  res.status(200).json(new ApiResponse(200, { category: toClient(category) }, "Subcategory updated successfully"));
});

// @route DELETE /api/admin/categories/:id/subcategories/:subId
export const deleteSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  category.subcategories = category.subcategories.filter(
    (s) => String(s._id) !== String(req.params.subId) && String(s.id) !== String(req.params.subId)
  );
  await category.save();

  res.status(200).json(new ApiResponse(200, { category: toClient(category) }, "Subcategory deleted successfully"));
});

// @route PUT /api/admin/categories/reorder (JSON body: { orderedIds: [id1, id2, ...] })
export const reorderCategories = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new ApiError(400, "orderedIds array is required");
  }

  const bulkOps = orderedIds.map((id, index) => {
    const filterId = mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : id;
    return {
      updateOne: {
        filter: { _id: filterId },
        update: { $set: { displayOrder: index } },
      },
    };
  });

  await Category.bulkWrite(bulkOps);

  const categories = await Category.find().sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json(new ApiResponse(200, { categories: categories.map(toClient) }, "Categories reordered successfully"));
});
