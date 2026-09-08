import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user/User.model.js";

// Protects user-only routes. Reads token from cookie OR Authorization header.
export const protectUser = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.user_token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, please login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(401, "User not found, please login again");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Not authorized, invalid or expired token");
  }
});

// Attaches req.user if logged in, but doesn't block guests (used for public browsing routes)
export const optionalUserAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.user_token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      req.user = null;
    }
  }
  next();
});

export default protectUser;
