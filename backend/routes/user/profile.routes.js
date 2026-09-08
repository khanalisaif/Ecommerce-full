import express from "express";
import { getProfile, updateProfile, updateProfilePicture, changePassword } from "../../controllers/user/profile.controller.js";
import { protectUser } from "../../middleware/userAuth.js";
import { upload } from "../../middleware/multer.js";

const router = express.Router();

router.use(protectUser);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/picture", upload.single("image"), updateProfilePicture);
router.put("/change-password", changePassword);

export default router;
