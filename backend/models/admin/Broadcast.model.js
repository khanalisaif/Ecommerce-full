import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    actionLink: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["news", "offer", "alert"],
      default: "news",
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const Broadcast = mongoose.model("Broadcast", broadcastSchema);
export default Broadcast;
