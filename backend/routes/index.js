import express from "express";

// user-side (auth-protected)
import userAuthRoutes from "./user/auth.routes.js";
import userProfileRoutes from "./user/profile.routes.js";
import userAddressRoutes from "./user/address.routes.js";
import userWishlistRoutes from "./user/wishlist.routes.js";
import userCartRoutes from "./user/cart.routes.js";
import userOrderRoutes from "./user/order.routes.js";
import userReviewRoutes from "./user/review.routes.js";
import userPaymentMethodRoutes from "./user/paymentMethod.routes.js";
import userPreferencesRoutes from "./user/preferences.routes.js";

// storefront (public, but grouped under user/ folder per project structure)
import productRoutes, { searchProducts } from "./user/product.routes.js";
import categoryRoutes from "./user/category.routes.js";
import siteContentRoutes from "./user/siteContent.routes.js";
import chatRoutes from "./user/chat.routes.js";

// admin-side (auth-protected except /admin/auth)
import adminAuthRoutes from "./admin/auth.routes.js";
import adminProductRoutes from "./admin/product.routes.js";
import adminCategoryRoutes from "./admin/category.routes.js";
import adminOrderRoutes from "./admin/order.routes.js";
import adminCustomerRoutes from "./admin/customer.routes.js";
import adminDashboardRoutes from "./admin/dashboard.routes.js";
import adminSiteContentRoutes from "./admin/siteContent.routes.js";

const router = express.Router();

// ---------- User (account) ----------
router.use("/user/auth", userAuthRoutes);
router.use("/user/profile", userProfileRoutes);
router.use("/user/addresses", userAddressRoutes);
router.use("/user/wishlist", userWishlistRoutes);
router.use("/user/cart", userCartRoutes);
router.use("/user/orders", userOrderRoutes);
router.use("/user/reviews", userReviewRoutes);
router.use("/user/payment-methods", userPaymentMethodRoutes);
router.use("/user/preferences", userPreferencesRoutes);

// ---------- Storefront (public browsing) ----------
router.use("/user/products", productRoutes);
router.use("/user/categories", categoryRoutes);
router.get("/user/search", searchProducts);
router.use("/content", siteContentRoutes); // /content, /content/:key — generic CMS key/value store (public read)
router.use("/chat", chatRoutes); // /chat — AI shopping assistant

// ---------- Admin ----------
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/products", adminProductRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin/orders", adminOrderRoutes);
router.use("/admin/customers", adminCustomerRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/content", adminSiteContentRoutes); // /admin/content/:key — generic CMS key/value store (admin write)

export default router;
