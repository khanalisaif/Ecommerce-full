import express from "express";
import {
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
} from "../../controllers/user/address.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.put("/:addressId/set-default", setDefaultAddress);

export default router;
