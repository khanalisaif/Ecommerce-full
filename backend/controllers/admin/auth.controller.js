import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Admin from "../../models/admin/Admin.model.js";
import { generateAdminToken } from "../../utils/generateToken.js";
import { getAdminEmails, sendAdminLoginAlert, sendOtpEmail } from "../../utils/sendEmail.js";
import { generateOtp, isOtpExpired } from "../../utils/otpUtil.js";

// @route POST /api/admin/auth/register
// Locked down to a small whitelist of emails (ADMIN_ALLOWED_EMAILS in .env,
// max 2) — nobody else can ever create an admin account through this route,
// no matter what password or role they submit.
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "name, email and password are required");

  const allowedEmails = getAdminEmails();
  if (allowedEmails.length === 0) {
    throw new ApiError(403, "Admin registration is not configured. Set ADMIN_ALLOWED_EMAILS in the backend .env first.");
  }
  if (!allowedEmails.includes(email.toLowerCase())) {
    throw new ApiError(403, "This email is not authorized to become an admin.");
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "Admin already exists with this email");

  const admin = await Admin.create({ name, email, password, role: role === "super-admin" ? "super-admin" : "admin" });

  res.status(201).json(new ApiResponse(201, { admin: sanitizeAdmin(admin) }, "Admin registered successfully"));
});

// @route POST /api/admin/auth/login
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, "Invalid admin credentials");
  }
  if (!admin.isActive) throw new ApiError(403, "Admin account is disabled");

  const token = generateAdminToken(res, admin._id);

  // Fire-and-forget: notify every configured admin email whenever ANY admin
  // logs in, so a compromised login is noticed immediately.
  sendAdminLoginAlert({
    name: admin.name,
    email: admin.email,
    time: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    ip: req.ip,
  }).catch((err) => console.error("Admin login alert failed:", err.message));

  res.status(200).json(new ApiResponse(200, { token, admin: sanitizeAdmin(admin) }, "Admin logged in successfully"));
});

// @route POST /api/admin/auth/request-otp-login
export const requestAdminOtpLogin = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Admin email is required");

  const cleanEmail = email.trim().toLowerCase();
  const admin = await Admin.findOne({ email: cleanEmail });
  if (!admin) throw new ApiError(404, "No admin account found with this email address");
  if (!admin.isActive) throw new ApiError(403, "This admin account is disabled");

  const { otp, expiresAt } = generateOtp();
  admin.otp = { code: otp, expiresAt, purpose: "admin-login" };
  await admin.save();

  try {
    await sendOtpEmail(admin.email, otp, "Admin Login");
  } catch (err) {
    console.error("Failed to send OTP email to admin:", err.message);
    throw new ApiError(500, "Failed to send OTP email. Please check email configuration.");
  }

  console.log(`🔑 [ADMIN OTP] Sent login OTP ${otp} to ${admin.email}`);

  res.status(200).json(
    new ApiResponse(
      200,
      { email: admin.email },
      "OTP has been sent to your registered admin email address"
    )
  );
});

// @route POST /api/admin/auth/verify-otp-login
export const verifyAdminOtpLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const cleanEmail = email.trim().toLowerCase();
  const admin = await Admin.findOne({ email: cleanEmail }).select("+otp.code +otp.expiresAt +otp.purpose");
  if (!admin) throw new ApiError(404, "Admin not found");
  if (!admin.isActive) throw new ApiError(403, "This admin account is disabled");

  if (admin.otp?.purpose !== "admin-login" || admin.otp?.code !== otp.trim()) {
    throw new ApiError(400, "Invalid OTP code");
  }

  if (isOtpExpired(admin.otp?.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // Clear OTP once verified
  admin.otp = undefined;
  await admin.save();

  const token = generateAdminToken(res, admin._id);

  sendAdminLoginAlert({
    name: admin.name,
    email: admin.email,
    time: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    ip: req.ip,
  }).catch((err) => console.error("Admin login alert failed:", err.message));

  res.status(200).json(
    new ApiResponse(200, { token, admin: sanitizeAdmin(admin) }, "Admin logged in successfully with OTP")
  );
});

// @route POST /api/admin/auth/logout
export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("admin_token");
  res.status(200).json(new ApiResponse(200, null, "Admin logged out"));
});

// @route GET /api/admin/auth/me
export const getAdminMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { admin: req.admin }, "Current admin fetched"));
});

const sanitizeAdmin = (admin) => {
  const obj = admin.toObject ? admin.toObject() : admin;
  delete obj.password;
  return obj;
};
