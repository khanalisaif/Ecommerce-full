import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["PRIMARY", "HOME", "WORK", "OTHER"], default: "HOME" },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    pincode: { type: String, required: true },
    addressLine: { type: String, required: true }, // house no, street, area
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, enum: ["home", "work", "other"], default: "home" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["card", "upi"], required: true },
    // Card: only non-sensitive display data is ever stored — never the full
    // card number or CVV.
    last4: { type: String, default: "" },
    cardHolderName: { type: String, default: "" },
    expiry: { type: String, default: "" }, // MM/YY, display only
    // UPI:
    upiId: { type: String, default: "" },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true },

    // Optional for social-login accounts (Google/Facebook don't always
    // provide a phone number). Required only for local email+password signup.
    mobileNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows multiple docs with no mobileNumber
      required: function () {
        return this.authProvider === "local";
      },
    },

    // Required only for local accounts — social-login accounts authenticate
    // via their provider's token, never a locally-stored password.
    password: {
      type: String,
      minlength: 6,
      select: false,
      required: function () {
        return this.authProvider === "local";
      },
    },

    // ---- Social login ----
    authProvider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    googleId: { type: String, unique: true, sparse: true, select: false },
    facebookId: { type: String, unique: true, sparse: true, select: false },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other", ""],
      default: "",
      set: (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : ""),
    },
    dob: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    interests: [{ type: String }],

    addresses: [addressSchema],

    paymentMethods: [paymentMethodSchema],

    preferences: {
      privacy: {
        profileVisible: { type: Boolean, default: true },
        showActivity: { type: Boolean, default: false },
        dataSharing: { type: Boolean, default: true },
        personalizedAds: { type: Boolean, default: false },
        emailMarketing: { type: Boolean, default: true },
        smsMarketing: { type: Boolean, default: false },
      },
      notifications: {
        orders: { type: Boolean, default: true },
        offers: { type: Boolean, default: true },
        wishlist: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        news: { type: Boolean, default: true },
      },
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // OTP handling (signup verification, login OTP, 2FA)
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      purpose: { type: String, enum: ["signup", "login", "reset", "2fa"], select: false },
    },

    // Forgot-password EMAIL LINK flow (separate from the OTP flow above) —
    // a random token is hashed and stored here; the raw token is only ever
    // emailed to the user, never persisted.
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual("memberSince").get(function () {
  return this.createdAt;
});

userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);
export default User;
