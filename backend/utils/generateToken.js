import jwt from "jsonwebtoken";

// User-side JWT (cookie: user_token)
export const generateUserToken = (res, userId) => {
  const token = jwt.sign({ id: userId, role: "user" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("user_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// Admin-side JWT (cookie: admin_token) — kept fully separate from user auth
export const generateAdminToken = (res, adminId) => {
  const token = jwt.sign({ id: adminId, role: "admin" }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "1d",
  });

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

export default { generateUserToken, generateAdminToken };
