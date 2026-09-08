import express from "express";
import { getPreferences, updatePreferences } from "../../controllers/user/preferences.controller.js";
import { protectUser } from "../../middleware/userAuth.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getPreferences);
router.put("/", updatePreferences);

export default router;
