import express from "express";
import { placeOrder, getMyOrders, getOrderById, cancelOrder, trackOrder } from "../../controllers/user/order.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();
router.use(protectUser);

router.post("/",                       placeOrder);
router.get("/",                        getMyOrders);
router.get("/:orderId",                getOrderById);
router.put("/:orderId/cancel",         cancelOrder);
router.get("/:orderId/track",          trackOrder);   // Live Delhivery tracking

export default router;
