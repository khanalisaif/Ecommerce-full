import express from "express";
import { getMyCoins } from "../../controllers/user/coins.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getMyCoins);

export default router;
