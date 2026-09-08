import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Cart from "../../models/user/Cart.model.js";
import Product from "../../models/admin/Product.model.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route GET /api/user/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product");

  const subtotal = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);

  res.status(200).json(new ApiResponse(200, { cart, subtotal }, "Cart fetched"));
});

// @route POST /api/user/cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = "", color = "" } = req.body;
  if (!productId) throw new ApiError(400, "productId is required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const cart = await getOrCreateCart(req.user._id);

  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.size === size && i.color === color
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity, size, color, priceAtAdd: product.price });
  }

  await cart.save();
  await cart.populate("items.product");

  res.status(200).json(new ApiResponse(200, { cart }, "Added to cart"));
});

// @route PUT /api/user/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new ApiError(400, "quantity must be at least 1");

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Cart item not found");

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");

  res.status(200).json(new ApiResponse(200, { cart }, "Cart item updated"));
});

// @route DELETE /api/user/cart/:itemId
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const cart = await getOrCreateCart(req.user._id);

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  item.deleteOne();

  await cart.save();
  await cart.populate("items.product");

  res.status(200).json(new ApiResponse(200, { cart }, "Item removed from cart"));
});

// @route DELETE /api/user/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart }, "Cart cleared"));
});
