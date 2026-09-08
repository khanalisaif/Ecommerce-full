import express from "express";
import { getMyReviews, updateReview, deleteReview, markReviewHelpful } from "../../controllers/user/review.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getMyReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.post("/:id/helpful", markReviewHelpful);

export default router;
