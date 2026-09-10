import Subscriber from "../../models/user/Subscriber.model.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { getClientUrl } from "../../utils/urlHelper.js";

const brandName = "HASHTELICOM";

/**
 * POST /api/user/subscribe
 * Subscribe an email for offers & updates (no account required)
 */
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return res.status(200).json({
          message: "You're already subscribed! We'll keep sending you the best deals.",
          alreadySubscribed: true,
        });
      }
      // Re-subscribe if previously unsubscribed
      existing.isActive = true;
      await existing.save();
      await sendSubscriptionWelcomeEmail(email, existing.unsubscribeToken);
      return res.status(200).json({
        message: "Welcome back! You've been re-subscribed to Hashtelicom updates.",
      });
    }

    // New subscriber
    const newSub = await Subscriber.create({
      email: email.toLowerCase(),
      source: req.body.source || "signup_page",
    });

    // Send welcome confirmation email
    await sendSubscriptionWelcomeEmail(email, newSub.unsubscribeToken);

    return res.status(201).json({
      message: "🎉 You're now subscribed! Check your inbox for a welcome email.",
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ message: "Subscription failed. Please try again." });
  }
};

/**
 * GET /api/user/subscribe/unsubscribe/:token
 * Unsubscribe via one-click link in email
 */
export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    const isHtml = req.headers.accept?.includes("text/html");
    const clientUrl = getClientUrl();

    if (!subscriber) {
      if (isHtml) {
        return res.redirect(`${clientUrl}/unsubscribe?status=invalid`);
      }
      return res.status(404).json({ message: "Invalid unsubscribe link." });
    }

    subscriber.isActive = false;
    await subscriber.save();

    if (isHtml) {
      return res.redirect(`${clientUrl}/unsubscribe?status=success`);
    }

    return res.status(200).json({
      message: "You've been successfully unsubscribed. You won't receive any more emails from us.",
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return res.status(500).json({ message: "Failed to unsubscribe. Please try again." });
  }
};

/** Internal: Send styled welcome/confirmation email */
const sendSubscriptionWelcomeEmail = async (email, unsubscribeToken = "") => {
  const clientUrl = getClientUrl();
  const subject = `Welcome to ${brandName}! Exclusive Offers Await You 🎉`;
  const unsubUrl = unsubscribeToken
    ? `${clientUrl}/unsubscribe?token=${unsubscribeToken}`
    : clientUrl;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 22px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; font-size: 28px; font-weight: 900; letter-spacing: 2px; padding: 10px 24px; border-radius: 10px; margin-bottom: 12px;">
          HASHTELICOM
        </div>
        <h2 style="color: #1e293b; margin: 0; font-size: 22px;">🎉 You're In!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Thanks for subscribing to our exclusive updates</p>
      </div>

      <div style="background: linear-gradient(135deg, #faf5ff, #fff0fb); border-radius: 10px; padding: 20px; margin-bottom: 22px; text-align: center; border: 1px solid #f3e8ff;">
        <p style="color: #7c3aed; font-size: 16px; font-weight: bold; margin: 0 0 8px;">What you'll get:</p>
        <table style="width: 100%; font-size: 13px; color: #475569; text-align: left; border-spacing: 0;">
          <tr>
            <td style="padding: 6px 8px;">🎁</td>
            <td style="padding: 6px 0;">Exclusive coupons & special offers</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px;">📱</td>
            <td style="padding: 6px 0;">New product launches & deals</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px;">💡</td>
            <td style="padding: 6px 0;">Free tips & wellness updates</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px;">⚡</td>
            <td style="padding: 6px 0;">Flash sales & limited-time offers</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${clientUrl}" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 13px 32px; border-radius: 999px; display: inline-block;">
          Shop Now at Hashtelicom
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.6;">
        You subscribed with <b>${email}</b>.<br/>
        Don't want to hear from us? <a href="${unsubUrl}" style="color: #7c3aed;">Unsubscribe anytime</a>.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;

  try {
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.warn("Subscription welcome email failed:", err.message);
  }
};

