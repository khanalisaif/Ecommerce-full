import express from "express";
import { getContent, getAllContent } from "../../controllers/admin/siteContent.controller.js";

const router = express.Router();

router.get("/", getAllContent);
router.get("/:key", getContent);

export default router;
