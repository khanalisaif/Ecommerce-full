import express from "express";
import { getPaymentMethods, addPaymentMethod, deletePaymentMethod } from "../../controllers/user/paymentMethod.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getPaymentMethods);
router.post("/", addPaymentMethod);
router.delete("/:id", deletePaymentMethod);

export default router;
