import express from "express";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../controllers/admin/category.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
