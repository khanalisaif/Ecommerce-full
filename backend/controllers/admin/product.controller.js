import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Product from "../../models/admin/Product.model.js";
import Category from "../../models/admin/Category.model.js";
import { resolveImages } from "../../config/cloudinary.js";

const resolveCategory = async (categoryInput) => {
  // Accepts either a category slug (what the admin form sends) or a raw ObjectId.
  let categoryDoc = null;
  if (mongooseIdLike(categoryInput)) {
    categoryDoc = await Category.findById(categoryInput);
  }
  if (!categoryDoc) {
    categoryDoc = await Category.findOne({ slug: categoryInput });
  }
  if (!categoryDoc) throw new ApiError(404, `Category not found: ${categoryInput}`);
  return categoryDoc;
};

const mongooseIdLike = (val) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

// @route GET /api/admin/products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, search = "" } = req.query;
  const filter = search
    ? { $or: [{ name: new RegExp(search, "i") }, { brand: new RegExp(search, "i") }, { sku: new RegExp(search, "i") }] }
    : {};

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { products, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }, "Products fetched")
  );
});

// @route GET /api/admin/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, { product }, "Product fetched"));
});

// @route POST /api/admin/products (JSON body — images: array of data-URI or hosted-URL strings)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, brand, brand_name, brandName, description, category,
    price, originalPrice, stock, colors, sizes, images,
    isAssured, isBestSeller, isNewArrival, badge, sku, discount, rating, reviews,
  } = req.body;

  if (!name || !brand || !category || price === undefined) {
    throw new ApiError(400, "name, brand, category and price are required");
  }

  const categoryDoc = await resolveCategory(category);
  const resolvedImages = await resolveImages(images, "hashtelicom/products");

  const product = await Product.create({
    name,
    brand: String(brand).toUpperCase(),
    brandName: brandName || brand_name || brand,
    description,
    sku,
    category: categoryDoc._id,
    categorySlug: categoryDoc.slug,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    discount: discount || "",
    images: resolvedImages,
    colors: Array.isArray(colors) ? colors : [],
    sizes: Array.isArray(sizes) ? sizes : [],
    stock: stock !== undefined ? Number(stock) : 0,
    rating: rating !== undefined ? Number(rating) : undefined,
    reviews: reviews !== undefined ? Number(reviews) : undefined,
    isAssured: isAssured !== undefined ? !!isAssured : true,
    isBestSeller: !!isBestSeller,
    isNewArrival: !!isNewArrival,
    badge: badge || "",
  });

  res.status(201).json(new ApiResponse(201, { product }, "Product created successfully"));
});

// @route PUT /api/admin/products/:id (JSON body)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const {
    name, brand, brand_name, brandName, description, category,
    price, originalPrice, stock, colors, sizes, images,
    isAssured, isBestSeller, isNewArrival, badge, sku, discount, isActive, rating, reviews,
  } = req.body;

  if (name !== undefined) product.name = name;
  if (brand !== undefined) product.brand = String(brand).toUpperCase();
  if (brandName !== undefined || brand_name !== undefined) product.brandName = brandName || brand_name;
  if (description !== undefined) product.description = description;
  if (sku !== undefined) product.sku = sku;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (discount !== undefined) product.discount = discount;
  if (Array.isArray(colors)) product.colors = colors;
  if (Array.isArray(sizes)) product.sizes = sizes;
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (reviews !== undefined) product.reviews = Number(reviews);
  if (isAssured !== undefined) product.isAssured = !!isAssured;
  if (isBestSeller !== undefined) product.isBestSeller = !!isBestSeller;
  if (isNewArrival !== undefined) product.isNewArrival = !!isNewArrival;
  if (isActive !== undefined) product.isActive = !!isActive;
  if (badge !== undefined) product.badge = badge;

  if (category !== undefined) {
    const categoryDoc = await resolveCategory(category);
    product.category = categoryDoc._id;
    product.categorySlug = categoryDoc.slug;
  }

  if (Array.isArray(images)) {
    product.images = await resolveImages(images, "hashtelicom/products");
  }

  await product.save();
  res.status(200).json(new ApiResponse(200, { product }, "Product updated successfully"));
});

// @route DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  await product.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

// @route PUT /api/admin/products/:id/stock  (quick stock-only update, used by the Inventory tab)
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined) throw new ApiError(400, "stock is required");

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  product.stock = Math.max(0, Number(stock));
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, "Stock updated"));
});
