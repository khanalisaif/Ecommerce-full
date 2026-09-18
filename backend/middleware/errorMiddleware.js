import ApiError from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

// Central error handler — every thrown ApiError (or unexpected error) ends up here
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const rawField = Object.keys(err.keyValue || {})[0] || "";
    // Map MongoDB internal field names to user-friendly messages
    if (rawField.includes("mobileNumber") || rawField.includes("phone")) {
      message = "This mobile number is already registered. Please use a different number or log in.";
    } else if (rawField.includes("email")) {
      message = "This email address is already registered. Please use a different email or log in.";
    } else if (rawField.includes("googleId")) {
      message = "This Google account is already linked to another user.";
    } else if (rawField.includes("facebookId")) {
      message = "This Facebook account is already linked to another user.";
    } else {
      message = "This value already exists. Please use a different one.";
    }
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
