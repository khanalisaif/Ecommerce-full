import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../controllers/user/wishlist.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
