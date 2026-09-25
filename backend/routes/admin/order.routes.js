import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  // Delhivery
  confirmOrderWithDelhivery,
  resendToDelhivery,
  scheduleDelhiveryPickup,
  getDelhiveryLabel,
  cancelOrderOnDelhivery,
  trackDelhiveryOrder,
} from "../../controllers/admin/order.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();
router.use(protectAdmin);

// ── Standard CRUD ────────────────────────────────────────────────────────────
router.get("/",                    getAllOrders);
router.get("/:id",                 getOrderById);
router.put("/:id/status",          updateOrderStatus);
router.put("/:id/payment-status",  updatePaymentStatus);
router.delete("/:id",              deleteOrder);

// ── Delhivery ────────────────────────────────────────────────────────────────
// POST /api/admin/orders/:id/delhivery/confirm     → create shipment & get AWB
router.post("/:id/delhivery/confirm",  confirmOrderWithDelhivery);
// POST /api/admin/orders/:id/delhivery/resend      → re-create shipment (after cancel)
router.post("/:id/delhivery/resend",   resendToDelhivery);
// GET  /api/admin/orders/:id/delhivery/label       → fetch label PDF URL
router.get("/:id/delhivery/label",     getDelhiveryLabel);
// POST /api/admin/orders/:id/delhivery/cancel      → cancel on Delhivery + mark Cancelled
router.post("/:id/delhivery/cancel",   cancelOrderOnDelhivery);
// GET  /api/admin/orders/:id/delhivery/track       → live tracking scans
router.get("/:id/delhivery/track",     trackDelhiveryOrder);
// POST /api/admin/orders/delhivery/schedule-pickup → bulk pickup request
router.post("/delhivery/schedule-pickup", scheduleDelhiveryPickup);

export default router;
