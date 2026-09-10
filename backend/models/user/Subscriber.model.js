import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["signup_page", "login_page", "footer", "popup", "unsubscribe_page"],
      default: "signup_page",
    },
    unsubscribeToken: {
      type: String,
      default: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);
