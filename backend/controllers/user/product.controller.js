import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Product from "../../models/admin/Product.model.js";

// Maps a Product doc onto the exact shape the frontend's normalizeProduct()
// already expects, so ShopContext can use API results with zero adapting.
const toStorefront = (p) => {
  const obj = p.toObject ? p.toObject({ virtuals: true }) : p;
  return {
    id: String(obj._id),
    name: obj.name,
    description: obj.description || "",
    brand: obj.brand,
    brand_name: obj.brandName || obj.brand,
    category: obj.categorySlug,
    price: obj.price,
    originalPrice: obj.originalPrice,
    discount: obj.discount || "",
    rating: obj.rating,
    reviews: obj.reviews,
    image: obj.images?.[0] || "",
    images: obj.images || [],
    color: (obj.colors?.[0] && typeof obj.colors[0] === 'object') ? (obj.colors[0].name || '') : (obj.colors?.[0] || ""),
    colors: obj.colors || [],
    sizes: obj.sizes || [],
    sizesStr: (obj.sizes || []).join(", "),
    stock: obj.stock,
    stockInfo: obj.stock > 0 ? "In Stock" : "Out of Stock",
    isAssured: obj.isAssured,
    badge: obj.badge || "",
    isBestSeller: obj.isBestSeller,
    isNewArrival: obj.isNewArrival,
    sku: obj.sku,
  };
};

// @route GET /api/user/products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, brand, color, minPrice, maxPrice, minRating, sort = "newest", page = 1, limit = 200 } = req.query;

  const filter = { isActive: true };
  if (category) filter.categorySlug = category;
  if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
  if (color) filter.colors = new RegExp(`^${color}$`, "i");
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      products: products.map(toStorefront),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, "Products fetched")
  );
});

// @route GET /api/user/products/best-sellers
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isBestSeller: true }).limit(20);
  res.status(200).json(new ApiResponse(200, { products: products.map(toStorefront) }, "Best sellers fetched"));
});

// @route GET /api/user/products/new-arrivals
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isNewArrival: true }).sort({ createdAt: -1 }).limit(20);
  res.status(200).json(new ApiResponse(200, { products: products.map(toStorefront) }, "New arrivals fetched"));
});

// @route GET /api/user/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json(new ApiResponse(200, { product: toStorefront(product) }, "Product fetched"));
});

// @route GET /api/user/search?q=
export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) throw new ApiError(400, "Search query 'q' is required");

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: new RegExp(q, "i") },
      { brand: new RegExp(q, "i") },
      { brandName: new RegExp(q, "i") },
      { categorySlug: new RegExp(q, "i") },
    ],
  }).limit(30);

  res.status(200).json(new ApiResponse(200, { products: products.map(toStorefront), query: q }, "Search results fetched"));
});
