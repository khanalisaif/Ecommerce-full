import express from "express";
import { sendChatMessage } from "../../controllers/user/chat.controller.js";

const router = express.Router();

router.post("/", sendChatMessage);

export default router;
