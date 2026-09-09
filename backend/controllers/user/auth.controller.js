import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../models/user/User.model.js";
import { generateUserToken } from "../../utils/generateToken.js";
import { generateOtp, isOtpExpired } from "../../utils/otpUtil.js";
import { sendOtpSms, TEMPLATES } from "../../utils/sendSms.js";
import { sendOtpEmail, sendPasswordResetLinkEmail, sendSecurityAlertEmail } from "../../utils/sendEmail.js";
import { generateResetToken, hashToken } from "../../utils/resetToken.js";

// Helper: fire OTP over SMS + email in parallel, never block on SMS failure
const dispatchOtp = async ({ mobileNumber, email }, otp, templateName, purposeLabel) => {
  console.log(`📡 [OTP DISPATCH] Initiating OTP send for Mobile: ${mobileNumber}, Email: ${email}, Template: ${templateName}, Purpose: ${purposeLabel}`);
  const results = await Promise.allSettled([
    mobileNumber ? sendOtpSms(mobileNumber, templateName, otp) : Promise.resolve(false),
    email ? sendOtpEmail(email, otp, purposeLabel) : Promise.resolve(false),
  ]);
  const smsRes = results[0]?.status === "fulfilled" ? results[0].value : `Failed: ${results[0]?.reason?.message}`;
  const emailRes = results[1]?.status === "fulfilled" ? "Sent" : `Failed: ${results[1]?.reason?.message}`;
  console.log(`📡 [OTP DISPATCH] Completed -> SMS: ${smsRes}, Email: ${emailRes}`);
};

// @route POST /api/user/auth/signup
// Creates the user in an unverified state and sends a signup OTP
export const signup = asyncHandler(async (req, res) => {
  const { fullName, gender, email, mobileNumber, password } = req.body;

  if (!fullName || !email || !mobileNumber || !password) {
    throw new ApiError(400, "Full Name, Email, Mobile Number, and Password are all required");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobileNumber.trim();
  const formattedGender = gender ? (gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()) : "";

  const existing = await User.findOne({ $or: [{ email: cleanEmail }, { mobileNumber: cleanMobile }] });
  if (existing) {
    if (existing.isEmailVerified) {
      throw new ApiError(409, "An account already exists with this email or mobile number. Please log in.");
    }
    // Update existing unverified record and send fresh OTP
    existing.fullName = fullName.trim();
    if (formattedGender) existing.gender = formattedGender;
    existing.email = cleanEmail;
    existing.mobileNumber = cleanMobile;
    existing.password = password; // pre-save will hash
    const { otp, expiresAt } = generateOtp();
    existing.otp = { code: otp, expiresAt, purpose: "signup" };
    await existing.save();

    await dispatchOtp({ mobileNumber: cleanMobile, email: cleanEmail }, otp, TEMPLATES.SIGNUP, "Sign Up");

    return res
      .status(201)
      .json(new ApiResponse(201, { userId: existing._id, email: cleanEmail, mobileNumber: cleanMobile }, "OTP sent. Please verify to complete signup."));
  }

  const { otp, expiresAt } = generateOtp();

  const user = await User.create({
    fullName: fullName.trim(),
    gender: formattedGender,
    email: cleanEmail,
    mobileNumber: cleanMobile,
    password,
    authProvider: "local",
    otp: { code: otp, expiresAt, purpose: "signup" },
  });

  await dispatchOtp({ mobileNumber: cleanMobile, email: cleanEmail }, otp, TEMPLATES.SIGNUP, "Sign Up");

  res
    .status(201)
    .json(new ApiResponse(201, { userId: user._id, email: cleanEmail, mobileNumber: cleanMobile }, "OTP sent. Please verify to complete signup."));
});

// @route POST /api/user/auth/resend-signup-otp
export const resendSignupOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) throw new ApiError(400, "userId is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.isEmailVerified) {
    throw new ApiError(400, "This account is already verified. Please log in.");
  }

  const { otp, expiresAt } = generateOtp();
  user.otp = { code: otp, expiresAt, purpose: "signup" };
  await user.save();

  await dispatchOtp({ mobileNumber: user.mobileNumber, email: user.email }, otp, TEMPLATES.SIGNUP, "Sign Up");

  res.status(200).json(new ApiResponse(200, { userId: user._id }, "OTP resent to your registered email and mobile"));
});

// @route POST /api/user/auth/verify-signup-otp
export const verifySignupOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) throw new ApiError(400, "userId and otp are required");

  const user = await User.findById(userId).select("+otp.code +otp.expiresAt +otp.purpose");
  if (!user) throw new ApiError(404, "User not found");

  if (user.otp?.purpose !== "signup" || user.otp?.code !== otp.trim()) {
    throw new ApiError(400, "Invalid OTP code. Please check and enter again.");
  }
  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please click 'Resend OTP' to get a new code.");
  }

  user.isEmailVerified = true;
  user.isMobileVerified = true;
  user.otp = undefined;
  await user.save();

  const token = generateUserToken(res, user._id);

  res.status(200).json(new ApiResponse(200, { token, user: sanitizeUser(user) }, "Signup verified successfully"));
});

// @route POST /api/user/auth/login (password based)
export const login = asyncHandler(async (req, res) => {
  const { emailOrMobile, password } = req.body;
  if (!emailOrMobile || !password) throw new ApiError(400, "Email/Mobile and password are required");

  const clean = emailOrMobile.trim();
  const digits = clean.replace(/\D/g, "").slice(-10);
  const user = await User.findOne({
    $or: [
      { email: clean.toLowerCase() },
      { mobileNumber: clean },
      ...(digits.length === 10 ? [{ mobileNumber: digits }] : []),
    ],
  }).select("+password");

  if (!user || user.authProvider !== "local" || !(await user.comparePassword(password))) {
    if (user && user.authProvider !== "local") {
      throw new ApiError(400, `This account uses ${user.authProvider} sign-in. Please continue with ${user.authProvider}.`);
    }
    throw new ApiError(401, "Invalid email/mobile or password");
  }
  if (!user.isActive) throw new ApiError(403, "Account is disabled, contact support");

  const token = generateUserToken(res, user._id);

  if (user.preferences?.notifications?.security !== false && user.email) {
    sendSecurityAlertEmail(user.email, {
      userName: user.fullName,
      eventType: "Account Sign-In",
      time: new Date().toLocaleString("en-IN"),
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("Security alert email failed:", err.message));
  }

  res.status(200).json(new ApiResponse(200, { token, user: sanitizeUser(user) }, "Logged in successfully"));
});

// @route POST /api/user/auth/request-otp-login
export const requestOtpLogin = asyncHandler(async (req, res) => {
  const { emailOrMobile } = req.body;
  if (!emailOrMobile) throw new ApiError(400, "Email or phone number is required");

  const clean = emailOrMobile.trim();
  const digits = clean.replace(/\D/g, "").slice(-10);
  const user = await User.findOne({
    $or: [
      { email: clean.toLowerCase() },
      { mobileNumber: clean },
      ...(digits.length === 10 ? [{ mobileNumber: digits }] : []),
    ],
  });
  if (!user) throw new ApiError(404, "No account found with this email/mobile. Please check or create an account.");

  const { otp, expiresAt } = generateOtp();
  user.otp = { code: otp, expiresAt, purpose: "login" };
  await user.save();

  await dispatchOtp({ mobileNumber: user.mobileNumber, email: user.email }, otp, TEMPLATES.LOGIN, "Login");

  res.status(200).json(new ApiResponse(200, { userId: user._id, email: user.email, mobileNumber: user.mobileNumber }, "OTP sent to your registered email and mobile"));
});

// @route POST /api/user/auth/verify-otp-login
export const verifyOtpLogin = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) throw new ApiError(400, "userId and otp are required");

  const user = await User.findById(userId).select("+otp.code +otp.expiresAt +otp.purpose");
  if (!user) throw new ApiError(404, "User not found");

  if (user.otp?.purpose !== "login" || user.otp?.code !== otp.trim()) {
    throw new ApiError(400, "Invalid OTP code. Please check and enter again.");
  }
  if (isOtpExpired(user.otp.expiresAt)) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  user.otp = undefined;
  await user.save();

  const token = generateUserToken(res, user._id);

  if (user.preferences?.notifications?.security !== false && user.email) {
    sendSecurityAlertEmail(user.email, {
      userName: user.fullName,
      eventType: "OTP Sign-In",
      time: new Date().toLocaleString("en-IN"),
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("Security alert email failed:", err.message));
  }

  res.status(200).json(new ApiResponse(200, { token, user: sanitizeUser(user) }, "Logged in successfully with OTP"));
});

// @route POST /api/user/auth/forgot-password
// Emails a clickable reset LINK (not an OTP code) — the standard "forgot
// password" flow used by most web apps.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email address is required");

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to check which emails are registered.
  if (!user || user.authProvider !== "local") {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "If an account exists for that email, a reset link has been sent."));
  }

  const { rawToken, hashedToken, expiresAt } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = expiresAt;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
  try {
    await sendPasswordResetLinkEmail(user.email, resetUrl);
  } catch (emailErr) {
    console.error("⚠️ Failed to send reset email:", emailErr.message);
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "If an account exists for that email, a reset link has been sent."));
});

// @route GET /api/user/auth/reset-password/:token/valid
// Lets the reset-password page confirm the link is valid before rendering the form.
export const checkResetToken = asyncHandler(async (req, res) => {
  const hashedToken = hashToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  res.status(200).json(new ApiResponse(200, { valid: !!user }, user ? "Link is valid" : "Link is invalid or expired"));
});

// @route POST /api/user/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) throw new ApiError(400, "newPassword is required");

  const hashedToken = hashToken(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) throw new ApiError(400, "This reset link is invalid or has expired. Please request a new one.");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  if (user.preferences?.notifications?.security !== false && user.email) {
    sendSecurityAlertEmail(user.email, {
      userName: user.fullName,
      eventType: "Password Changed",
      time: new Date().toLocaleString("en-IN"),
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
    }).catch((err) => console.error("Security alert email failed:", err.message));
  }

  res.status(200).json(new ApiResponse(200, null, "Password reset successfully, please login"));
});

// ---------------- Social login ----------------

const findOrCreateSocialUser = async ({ provider, providerId, email, fullName, picture }) => {
  const idField = provider === "google" ? "googleId" : "facebookId";

  let user = await User.findOne({ [idField]: providerId });
  if (user) return user;

  // If an account with this email already exists (e.g. signed up with a
  // password before), link the social provider to it instead of erroring.
  user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user[idField] = providerId;
    if (picture && !user.profilePicture) user.profilePicture = picture;
    await user.save();
    return user;
  }

  user = await User.create({
    fullName: fullName || email.split("@")[0],
    email: email.toLowerCase(),
    authProvider: provider,
    [idField]: providerId,
    profilePicture: picture || "",
    isEmailVerified: true, // the provider already verified this email
  });
  return user;
};

// @route POST /api/user/auth/google
// Body: EITHER { credential } — an ID token from Google Identity Services'
// One Tap / rendered button — OR { accessToken } — from the OAuth2 token
// client flow (used when triggering sign-in from a custom-styled button).
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, accessToken } = req.body;
  if (!credential && !accessToken) throw new ApiError(400, "credential or accessToken is required");

  let profile;
  try {
    if (credential) {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!verifyRes.ok) throw new Error("Google token verification failed");
      const payload = await verifyRes.json();
      if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error("Google credential was not issued for this app");
      }
      profile = { id: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
    } else {
      const verifyRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!verifyRes.ok) throw new Error("Google token verification failed");
      const payload = await verifyRes.json();
      profile = { id: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
    }
  } catch (err) {
    throw new ApiError(401, err.message || "Invalid Google credential");
  }

  if (!profile.email) throw new ApiError(400, "Google account has no email");

  const user = await findOrCreateSocialUser({
    provider: "google",
    providerId: profile.id,
    email: profile.email,
    fullName: profile.name,
    picture: profile.picture,
  });

  if (!user.isActive) throw new ApiError(403, "Account is disabled, contact support");

  const token = generateUserToken(res, user._id);
  res.status(200).json(new ApiResponse(200, { token, user: sanitizeUser(user) }, "Logged in with Google"));
});

// @route POST /api/user/auth/facebook
// Body: { accessToken } — the access token from the Facebook JS SDK
export const facebookAuth = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) throw new ApiError(400, "accessToken is required");

  let profile;
  try {
    const verifyRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );
    if (!verifyRes.ok) throw new Error("Facebook token verification failed");
    profile = await verifyRes.json();
  } catch (err) {
    throw new ApiError(401, "Invalid Facebook access token");
  }

  if (!profile.email) {
    throw new ApiError(400, "Your Facebook account has no email associated, or didn't grant email permission");
  }

  const user = await findOrCreateSocialUser({
    provider: "facebook",
    providerId: profile.id,
    email: profile.email,
    fullName: profile.name,
    picture: profile.picture?.data?.url,
  });

  if (!user.isActive) throw new ApiError(403, "Account is disabled, contact support");

  const token = generateUserToken(res, user._id);
  res.status(200).json(new ApiResponse(200, { token, user: sanitizeUser(user) }, "Logged in with Facebook"));
});

// @route POST /api/user/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("user_token");
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// @route GET /api/user/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Current user fetched"));
});

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.otp;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};
