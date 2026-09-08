import express from "express";
import {
  getProducts, getBestSellers, getNewArrivals, getProductById, searchProducts,
} from "../../controllers/user/product.controller.js";
import { getProductReviews, createReview } from "../../controllers/user/review.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

// All public — no login required to browse
router.get("/best-sellers", getBestSellers);
router.get("/new-arrivals", getNewArrivals);
router.get("/", getProducts);
router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", protectUser, createReview);
router.get("/:id", getProductById);

export { searchProducts };
export default router;
