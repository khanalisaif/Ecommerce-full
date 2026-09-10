import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import Broadcast from "../../models/admin/Broadcast.model.js";
import User from "../../models/user/User.model.js";
import Subscriber from "../../models/user/Subscriber.model.js";
import { sendNewsBroadcastEmail } from "../../utils/sendEmail.js";
import { resolveImage } from "../../config/cloudinary.js";

// @route POST /api/admin/broadcast/news
// Sends a news announcement to all users who have 'news' notifications enabled
export const sendNewsBroadcast = asyncHandler(async (req, res) => {
  const { title, message, bannerUrl = "", actionLink = "" } = req.body;

  if (!title?.trim() || !message?.trim()) {
    throw new ApiError(400, "Title and message are required for the broadcast");
  }

  // If bannerUrl is a base64 string (uploaded from device), upload to Cloudinary so email clients can render it
  let hostedBannerUrl = "";
  if (bannerUrl?.trim()) {
    try {
      hostedBannerUrl = await resolveImage(bannerUrl.trim(), "hashtelicom/broadcasts");
    } catch (uploadErr) {
      console.error("Failed to upload broadcast banner to Cloudinary:", uploadErr.message);
      hostedBannerUrl = bannerUrl.trim();
    }
  }

  // 1. Fetch unsubscribed emails so we NEVER send to them
  const unsubscribedList = await Subscriber.find({ isActive: false }).distinct("email");
  const unsubscribedSet = new Set(unsubscribedList.map((e) => e.toLowerCase()));

  // 2. Fetch active registered users with news notifications enabled
  const users = await User.find({
    isActive: true,
    email: { $exists: true, $ne: null },
    "preferences.notifications.news": { $ne: false },
  }).select("email");

  // 3. Fetch active newsletter subscribers
  const activeSubs = await Subscriber.find({ isActive: true }).select("email");

  // 4. Combine emails and strictly exclude anyone who has unsubscribed
  const emailSet = new Set();
  for (const u of users) {
    if (u.email) {
      const em = u.email.trim().toLowerCase();
      if (!unsubscribedSet.has(em)) emailSet.add(em);
    }
  }
  for (const s of activeSubs) {
    if (s.email) {
      const em = s.email.trim().toLowerCase();
      if (!unsubscribedSet.has(em)) emailSet.add(em);
    }
  }

  const recipientEmails = Array.from(emailSet);

  // Send email to all subscribers (settled, non-blocking failure for individual addresses)
  let sentCount = 0;
  if (recipientEmails.length > 0) {
    const results = await Promise.allSettled(
      recipientEmails.map((email) =>
        sendNewsBroadcastEmail(email, {
          title: title.trim(),
          message: message.trim(),
          bannerUrl: hostedBannerUrl,
          actionLink: actionLink.trim(),
        })
      )
    );
    sentCount = results.filter((r) => r.status === "fulfilled").length;
  }

  // Save to Broadcast history
  const broadcast = await Broadcast.create({
    title: title.trim(),
    message: message.trim(),
    bannerUrl: hostedBannerUrl,
    actionLink: actionLink.trim(),
    type: "news",
    recipientCount: sentCount,
    status: sentCount > 0 || recipientEmails.length === 0 ? "sent" : "failed",
    sentAt: new Date(),
  });

  res.status(201).json(
    new ApiResponse(
      201,
      { broadcast, sentCount, totalSubscribers: recipientEmails.length },
      `News broadcast sent successfully to ${sentCount} user(s)`
    )
  );
});

// @route GET /api/admin/broadcast
// Gets broadcast history
export const getAllBroadcasts = asyncHandler(async (req, res) => {
  const broadcasts = await Broadcast.find().sort({ sentAt: -1 }).limit(100);
  res.status(200).json(new ApiResponse(200, { broadcasts }, "Broadcast history fetched"));
});

// @route DELETE /api/admin/broadcast/:id
// Deletes a broadcast history record
export const deleteBroadcast = asyncHandler(async (req, res) => {
  const broadcast = await Broadcast.findById(req.params.id);
  if (!broadcast) throw new ApiError(404, "Broadcast not found");

  await Broadcast.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, { id: req.params.id }, "Broadcast record deleted successfully"));
});
