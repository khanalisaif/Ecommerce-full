import express from "express";
import {
  sendNewsBroadcast,
  getAllBroadcasts,
  deleteBroadcast,
} from "../../controllers/admin/broadcast.controller.js";
import { protectAdmin } from "../../middleware/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

router.post("/news", sendNewsBroadcast);
router.get("/", getAllBroadcasts);
router.delete("/:id", deleteBroadcast);

export default router;
