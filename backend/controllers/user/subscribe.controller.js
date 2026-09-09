import Subscriber from "../../models/user/Subscriber.model.js";
import { sendEmail } from "../../utils/sendEmail.js";

const brandName = "HASHTELICOM";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

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

    if (!subscriber) {
      if (isHtml) {
        return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/><title>Hashtelicom</title><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
        <body style="font-family: sans-serif; background: #f8fafc; padding: 50px 20px; text-align: center;">
          <div style="background: #fff; max-width: 440px; margin: auto; padding: 36px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #ef4444; margin-top: 0;">❌ Invalid Link</h2>
            <p style="color: #64748b;">This unsubscribe link is invalid or has already expired.</p>
            <a href="${clientUrl}" style="color: #7c3aed; font-weight: bold; text-decoration: none;">Return to store &rarr;</a>
          </div>
        </body>
        </html>
      `);
      }
      return res.status(404).json({ message: "Invalid unsubscribe link." });
    }

    subscriber.isActive = false;
    await subscriber.save();

    if (isHtml) {
      return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><title>Unsubscribed - Hashtelicom</title><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 50px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh;">
        <div style="background: #fff; max-width: 460px; width: 100%; padding: 40px 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); text-align: center; border: 1px solid #e2e8f0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; font-size: 22px; font-weight: 900; letter-spacing: 2px; padding: 8px 20px; border-radius: 8px; margin-bottom: 20px;">
            HASHTELICOM
          </div>
          <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 22px;">✅ You're Unsubscribed</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 25px;">
            You have been successfully removed from our promotional email list. You won't receive marketing emails from us anymore.
          </p>
          <a href="${clientUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 999px;">
            Return to Hashtelicom
          </a>
        </div>
      </body>
      </html>
    `);
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
  const subject = `Welcome to ${brandName}! Exclusive Offers Await You 🎉`;
  const unsubUrl = unsubscribeToken
    ? `${process.env.API_URL || "http://localhost:5000"}/api/user/subscribe/unsubscribe/${unsubscribeToken}`
    : `${clientUrl}`;

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
