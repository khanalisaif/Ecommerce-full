import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../controllers/admin/category.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

// Subcategory nested routes
router.post("/:id/subcategories", addSubcategory);
router.put("/:id/subcategories/:subId", updateSubcategory);
router.delete("/:id/subcategories/:subId", deleteSubcategory);

export default router;
