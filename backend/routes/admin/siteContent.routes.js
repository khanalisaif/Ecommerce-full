import express from "express";
import { setContent } from "../../controllers/admin/siteContent.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.put("/:key", protectAdmin, setContent);

export default router;
