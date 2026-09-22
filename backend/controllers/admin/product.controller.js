import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Product from "../../models/admin/Product.model.js";
import Category from "../../models/admin/Category.model.js";
import { resolveImages } from "../../config/cloudinary.js";
import slugify from "slugify";

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

const normalizeSizes = (sizes) => {
  if (!sizes) return [];
  let arr = sizes;
  if (typeof sizes === "string") {
    try {
      arr = JSON.parse(sizes);
    } catch {
      arr = sizes.split(",").map((s) => ({ size: s.trim(), qty: 0 })).filter((s) => s.size);
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        return trimmed ? { size: trimmed, qty: 0 } : null;
      }
      if (typeof item === "object" && item !== null) {
        const sizeName = String(item.size || item.label || "").trim();
        if (!sizeName) return null;
        return {
          size: sizeName,
          qty: Math.max(0, Number(item.qty ?? item.quantity ?? item.stock ?? 0) || 0),
        };
      }
      return null;
    })
    .filter(Boolean);
};

const computeTotalStock = (cleanSizes, colors, fallbackStock) => {
  // If colors have sizes or stock, colors is the primary source of truth for variant products
  if (Array.isArray(colors) && colors.length > 0) {
    let colorSum = 0;
    let hasColorStock = false;
    for (const c of colors) {
      if (typeof c === "object" && c !== null) {
        if (Array.isArray(c.sizes) && c.sizes.length > 0) {
          const cSum = c.sizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
          c.stock = cSum;
          colorSum += cSum;
          hasColorStock = true;
        } else if (c.stock !== undefined && c.stock !== null && !isNaN(Number(c.stock))) {
          colorSum += Number(c.stock);
          hasColorStock = true;
        }
      }
    }
    if (hasColorStock) return colorSum;
  }

  // If no colors, check product-level sizes
  if (Array.isArray(cleanSizes) && cleanSizes.length > 0) {
    const sum = cleanSizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
    return sum;
  }

  if (fallbackStock !== undefined && fallbackStock !== null && !isNaN(Number(fallbackStock))) {
    return Math.max(0, Number(fallbackStock));
  }
  return 0;
};

// @route GET /api/admin/products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const filter = search
    ? {
        $or: [
          { name: new RegExp(search, "i") },
          { brand: new RegExp(search, "i") },
          { sku: new RegExp(search, "i") },
          { subcategory: new RegExp(search, "i") },
          { keywords: new RegExp(search, "i") },
          { tags: new RegExp(search, "i") },
        ],
      }
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
    subcategory, subcategorySlug,
    keywords, tags,
    price, originalPrice, stock, colors, sizes, images,
    isAssured, isBestSeller, isNewArrival, badge, sku, discount, rating, reviews,
  } = req.body;

  if (!name || !brand || !category || price === undefined) {
    throw new ApiError(400, "name, brand, category and price are required");
  }

  const categoryDoc = await resolveCategory(category);
  const resolvedImages = await resolveImages(images, "hashtelicom/products");

  const finalSubcategorySlug = subcategorySlug || (subcategory ? slugify(subcategory, { strict: true, lower: true }) : "");

  const rawKeywords = Array.isArray(keywords) ? keywords : Array.isArray(tags) ? tags : [];
  const cleanKeywords = rawKeywords.map((k) => String(k).trim()).filter(Boolean);

  const cleanSizes = normalizeSizes(sizes);
  let parsedColors = Array.isArray(colors) ? colors : [];
  if (typeof colors === "string") {
    try { parsedColors = JSON.parse(colors); } catch { parsedColors = []; }
  }
  parsedColors = parsedColors.map((c) => {
    if (typeof c === "object" && c !== null && Array.isArray(c.sizes)) {
      const cNormSizes = normalizeSizes(c.sizes);
      const cStock = cNormSizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
      return { ...c, sizes: cNormSizes, stock: cStock };
    }
    return c;
  });
  const computedStock = computeTotalStock(cleanSizes, parsedColors, stock);

  const product = await Product.create({
    name,
    brand: String(brand).toUpperCase(),
    brandName: brandName || brand_name || brand,
    description,
    sku,
    category: categoryDoc._id,
    categorySlug: categoryDoc.slug,
    subcategory: subcategory || "",
    subcategorySlug: finalSubcategorySlug,
    keywords: cleanKeywords,
    tags: cleanKeywords,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    discount: discount || "",
    images: resolvedImages,
    colors: parsedColors,
    sizes: cleanSizes,
    stock: computedStock,
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
    subcategory, subcategorySlug,
    keywords, tags,
    price, originalPrice, stock, colors, sizes, images,
    isAssured, isBestSeller, isNewArrival, badge, sku, discount, isActive, rating, reviews,
  } = req.body;

  const oldPrice = product.price;
  const isPriceDrop = price !== undefined && Number(price) < oldPrice;

  if (name !== undefined) product.name = name;
  if (brand !== undefined) product.brand = String(brand).toUpperCase();
  if (brandName !== undefined || brand_name !== undefined) product.brandName = brandName || brand_name;
  if (description !== undefined) product.description = description;
  if (sku !== undefined) product.sku = sku;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (discount !== undefined) product.discount = discount;

  let cleanSizes = sizes !== undefined ? normalizeSizes(sizes) : undefined;
  let parsedColors = Array.isArray(colors)
    ? colors
    : (typeof colors === "string"
        ? (() => { try { return JSON.parse(colors); } catch { return []; } })()
        : undefined);

  if (Array.isArray(parsedColors)) {
    parsedColors = parsedColors.map((c) => {
      if (typeof c === "object" && c !== null && Array.isArray(c.sizes)) {
        const cNormSizes = normalizeSizes(c.sizes);
        const cStock = cNormSizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
        return { ...c, sizes: cNormSizes, stock: cStock };
      }
      return c;
    });
    product.colors = parsedColors;
    product.markModified("colors");

    // If sizes was not explicitly passed, aggregate from color sizes
    if (cleanSizes === undefined) {
      const aggMap = new Map();
      parsedColors.forEach((c) => {
        if (c && Array.isArray(c.sizes)) {
          c.sizes.forEach((s) => {
            if (s && s.size) {
              aggMap.set(s.size, (aggMap.get(s.size) || 0) + (Number(s.qty) || 0));
            }
          });
        }
      });
      if (aggMap.size > 0) {
        product.sizes = Array.from(aggMap.entries()).map(([size, qty]) => ({ size, qty }));
        product.markModified("sizes");
      }
    }
  }

  if (cleanSizes !== undefined) {
    product.sizes = cleanSizes;
    product.markModified("sizes");
  }

  if (cleanSizes !== undefined || parsedColors !== undefined) {
    product.stock = computeTotalStock(product.sizes, product.colors, stock !== undefined ? stock : product.stock);
  } else if (stock !== undefined) {
    product.stock = Math.max(0, Number(stock));
  }
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

  if (subcategory !== undefined) {
    product.subcategory = subcategory;
    product.subcategorySlug = subcategorySlug !== undefined
      ? subcategorySlug
      : (subcategory ? slugify(subcategory, { strict: true, lower: true }) : "");
  } else if (subcategorySlug !== undefined) {
    product.subcategorySlug = subcategorySlug;
  }

  if (keywords !== undefined || tags !== undefined) {
    const rawKeywords = Array.isArray(keywords) ? keywords : Array.isArray(tags) ? tags : [];
    const cleanKeywords = rawKeywords.map((k) => String(k).trim()).filter(Boolean);
    product.keywords = cleanKeywords;
    product.tags = cleanKeywords;
  }

  if (Array.isArray(images)) {
    product.images = await resolveImages(images, "hashtelicom/products");
  }

  await product.save();

  // If price dropped, alert users who have wishlisted this product
  if (isPriceDrop) {
    import("../../models/user/User.model.js")
      .then(({ default: User }) =>
        User.find({
          wishlist: product._id,
          "preferences.notifications.wishlist": { $ne: false },
          email: { $exists: true, $ne: null },
        }).select("fullName email")
      )
      .then((wishlistUsers) => {
        if (!wishlistUsers?.length) return;
        import("../../utils/sendEmail.js").then(({ sendWishlistPriceDropEmail }) => {
          wishlistUsers.forEach((u) => {
            sendWishlistPriceDropEmail(u.email, {
              userName: u.fullName,
              product: {
                id: product._id,
                name: product.name,
                image: product.images?.[0] || "",
              },
              oldPrice,
              newPrice: product.price,
            }).catch((err) => console.error("Wishlist price drop email error:", err.message));
          });
        });
      })
      .catch((err) => console.error("Wishlist query failed on price drop:", err.message));
  }

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
  const { stock, sizes, colors } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  let parsedColors = Array.isArray(colors)
    ? colors
    : (typeof colors === "string"
        ? (() => { try { return JSON.parse(colors); } catch { return []; } })()
        : undefined);

  if (Array.isArray(parsedColors)) {
    parsedColors = parsedColors.map((c) => {
      if (typeof c === "object" && c !== null) {
        if (Array.isArray(c.sizes)) {
          const cNormSizes = normalizeSizes(c.sizes);
          const cStock = cNormSizes.length > 0
            ? cNormSizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0)
            : Math.max(0, Number(c.stock) || 0);
          return { ...c, sizes: cNormSizes, stock: cStock };
        } else if (c.stock !== undefined) {
          return { ...c, sizes: [], stock: Math.max(0, Number(c.stock) || 0) };
        }
      }
      return c;
    });
    product.colors = parsedColors;
    product.markModified("colors");

    // Aggregate sizes across all colors if sizes wasn't explicitly passed
    if (sizes === undefined) {
      const aggMap = new Map();
      parsedColors.forEach((c) => {
        if (c && Array.isArray(c.sizes)) {
          c.sizes.forEach((s) => {
            if (s && s.size) {
              aggMap.set(s.size, (aggMap.get(s.size) || 0) + (Number(s.qty) || 0));
            }
          });
        }
      });
      if (aggMap.size > 0) {
        product.sizes = Array.from(aggMap.entries()).map(([size, qty]) => ({ size, qty }));
        product.markModified("sizes");
      }
    }
  }

  if (sizes !== undefined) {
    product.sizes = normalizeSizes(sizes);
    product.markModified("sizes");
  }

  if (product.colors?.length > 0 || product.sizes?.length > 0) {
    product.stock = computeTotalStock(product.sizes, product.colors, stock);
  } else if (stock !== undefined) {
    product.stock = Math.max(0, Number(stock));
  } else {
    throw new ApiError(400, "stock, sizes, or colors is required");
  }

  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, "Stock updated"));
});
