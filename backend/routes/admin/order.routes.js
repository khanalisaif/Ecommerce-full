import express from "express";
import { getAllOrders, getOrderById, updateOrderStatus, updatePaymentStatus, deleteOrder } from "../../controllers/admin/order.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/payment-status", updatePaymentStatus);
router.delete("/:id", deleteOrder);

export default router;
