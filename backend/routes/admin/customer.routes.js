import express from "express";
import { getAllCustomers, getCustomerById, toggleCustomerActive, deleteCustomer } from "../../controllers/admin/customer.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id/toggle-active", toggleCustomerActive);
router.delete("/:id", deleteCustomer);

export default router;
