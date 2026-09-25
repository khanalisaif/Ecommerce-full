import express from "express";
import { getDeliveryInfo, checkPincodeServiceability } from "../../controllers/user/delivery.controller.js";

const router = express.Router();

// Public — no auth needed. Used on the product detail page.
router.get("/tat",            getDeliveryInfo);
router.get("/serviceability", checkPincodeServiceability);

export default router;
