import express from "express";
import { getMyWallet } from "../../controllers/user/wallet.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getMyWallet);

export default router;
