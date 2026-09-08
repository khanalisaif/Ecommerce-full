import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Admin from "../models/admin/Admin.model.js";

// Protects admin-only routes. Fully separate token/secret from user auth.
export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.admin_token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Admin not authorized, please login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      throw new ApiError(401, "Admin not found, please login again");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized, invalid or expired admin token");
  }
});

// Restricts certain routes to super-admins only (e.g. managing other admins)
export const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== "super-admin") {
    throw new ApiError(403, "Only super-admin can perform this action");
  }
  next();
};

export default protectAdmin;
