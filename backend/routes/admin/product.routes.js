import express from "express";
import {
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock,
} from "../../controllers/admin/product.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.put("/:id/stock", updateStock);

export default router;
