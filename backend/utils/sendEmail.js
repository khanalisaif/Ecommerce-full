import "dotenv/config";
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

// ==============================================================
// Legacy Nodemailer (Hidden/Commented as backup)
// ==============================================================
/*
import nodemailer from "nodemailer";
let _transporter = null;
export const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SES_SMTP_USER,
        pass: process.env.SES_SMTP_PASS,
      },
    });
  }
  return _transporter;
};
*/

// ==============================================================
// Microsoft Graph API Client (Office 365 / Azure AD)
// ==============================================================
let _graphClient = null;

export const getGraphClient = () => {
  if (_graphClient) return _graphClient;

  try {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.MS_GRAPH_CLIENT_ID;
    const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      console.warn("⚠️ Microsoft Graph API credentials not fully configured in .env");
      return null;
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    _graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken("https://graph.microsoft.com/.default");
          return token.token;
        },
      },
    });
    return _graphClient;
  } catch (error) {
    console.error("❌ Error initializing Microsoft Graph Client:", error);
    return null;
  }
};

/**
 * Sends an email using Microsoft Graph API with HASHTELICOM branding
 * @param {Object} mailOptions
 * @param {string} mailOptions.to
 * @param {string} mailOptions.subject
 * @param {string} mailOptions.html
 * @param {string} [mailOptions.text]
 * @param {Array} [mailOptions.attachments] - Array of { filename, content }
 */
export const sendGraphEmail = async (mailOptions) => {
  const client = getGraphClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📧 [DEV] Graph client not available, mock email sent to ${mailOptions.to} (${mailOptions.subject})`
      );
      return { messageId: "dev-graph-mock-sent" };
    }
    throw new Error("Microsoft Graph client is not initialized.");
  }

  const mailbox = process.env.MAILBOX || "noreply@digivahan.in";
  const fromName = process.env.FROM_NAME || "HASHTELICOM";

  const message = {
    subject: mailOptions.subject,
    from: {
      emailAddress: {
        name: fromName,
        address: mailbox,
      },
    },
    body: {
      contentType: "HTML",
      content: mailOptions.html || mailOptions.text || "",
    },
    toRecipients: [
      {
        emailAddress: {
          address: mailOptions.to,
        },
      },
    ],
  };

  // Support for attachments (e.g. invoices, reports)
  if (mailOptions.attachments && mailOptions.attachments.length > 0) {
    message.attachments = mailOptions.attachments.map((att) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: att.filename,
      contentBytes: Buffer.isBuffer(att.content)
        ? att.content.toString("base64")
        : typeof att.content === "string"
        ? Buffer.from(att.content).toString("base64")
        : att.content,
    }));
  }

  console.log(`[HASHTELICOM Email Service] Sending email via Graph API to: ${mailOptions.to} (${mailOptions.subject})`);

  await client.api(`/users/${mailbox}/sendMail`).post({
    message,
    saveToSentItems: "true",
  });

  console.log(`📧 HASHTELICOM Email sent to ${mailOptions.to} (${mailOptions.subject})`);
  return { messageId: "graph-api-sent" };
};

/**
 * Send email (Drop-in replacement for existing sendEmail)
 * @param {{to: string, subject: string, html: string, text?: string, attachments?: Array}} options
 */
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    return await sendGraphEmail({ to, subject, html, text, attachments });
  } catch (err) {
    console.error(`⚠️ HASHTELICOM Email send failed to ${to}:`, err.message);
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 [DEV] Email error handled in development for ${to}`);
      return { messageId: "dev-error-handled" };
    }
    throw err;
  }
};

/**
 * Branded templates generator for HASHTELICOM
 */
export const getMailOptions = (templateType, email, otp) => {
  const fromEmail = process.env.FROM_EMAIL || "support@hashtelicom.com";
  const brandName = "HASHTELICOM";

  switch (templateType) {
    case "signup":
      return {
        from: `"${brandName}" <${fromEmail}>`,
        to: email,
        subject: `Registration - Verify Your Account | ${brandName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">🔐 Verify Your Account</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Secure your account with this verification code</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <b>${email}</b>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">Welcome to <b>${brandName}</b>! Use the code below to verify your account and get started:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 32px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
            <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          </div>
        `,
      };

    case "login":
      return {
        from: `"${brandName}" <${fromEmail}>`,
        to: email,
        subject: `Signin - Verify Your Account | ${brandName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">🔐 Verify Your Account</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Secure your account with this verification code</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <b>${email}</b>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the code below to sign into your <b>${brandName}</b> account:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 32px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
            <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          </div>
        `,
      };

    case "reset":
      return {
        from: `"${brandName}" <${fromEmail}>`,
        to: email,
        subject: `Reset Your Password | ${brandName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">🔐 Reset Your Password</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Secure your account with this verification code</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <b>${email}</b>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the code below to reset your <b>${brandName}</b> password:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 32px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
            <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          </div>
        `,
      };

    default:
      return {
        from: `"${brandName}" <${fromEmail}>`,
        to: email,
        subject: `Your OTP | ${brandName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #7c3aed;">${brandName}</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 26px; font-weight: bold; letter-spacing: 6px; padding: 10px 28px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes.</p>
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
          </div>
        `,
      };
  }
};

/**
 * Send OTP via Email using Microsoft Graph API
 */
export const sendOTPViaEmail = async (email, otp, templateType = "signup") => {
  try {
    const mailOptions = getMailOptions(templateType, email, otp);
    const result = await sendGraphEmail(mailOptions);
    console.log(`📧 Email sent to ${email} via Graph API:`, result.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email OTP:", error);
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 [DEV] Email failed, but OTP for ${email} is: ${otp}. Valid for 10 minutes.`);
      return true;
    }
    return false;
  }
};

// Password reset link email (clickable link)
export const sendPasswordResetLinkEmail = async (to, resetUrl) => {
  const subject = "Reset your HASHTELICOM password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #7c3aed;">HASHTELICOM</h2>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 13px;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #999; font-size: 11px; word-break: break-all;">Or copy this link: ${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} HASHTELICOM. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

// Parses ADMIN_ALLOWED_EMAILS ("a@x.com,b@y.com") into a clean array
export const getAdminEmails = () => {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .slice(0, 2);
};

// Sends a notification to every configured admin email
const notifyAdmins = async (subject, html) => {
  const emails = getAdminEmails();
  if (!emails.length) return;
  try {
    await Promise.allSettled(emails.map((to) => sendEmail({ to, subject, html })));
  } catch (err) {
    console.error("Failed to notify admin(s):", err.message);
  }
};

export const sendAdminLoginAlert = async ({ name, email, time, ip }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #7c3aed;">Admin Login Alert</h2>
      <p><b>${name}</b> (${email}) just logged into the HASHTELICOM admin panel.</p>
      <p style="color: #666; font-size: 13px;">Time: ${time}${ip ? `<br/>IP: ${ip}` : ""}</p>
      <p style="color: #999; font-size: 12px;">If this wasn't you, change the admin password immediately.</p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} HASHTELICOM. All rights reserved.</p>
    </div>
  `;
  return notifyAdmins("Admin Login Alert — HASHTELICOM", html);
};

export const sendNewOrderAlert = async (order) => {
  const itemsHtml = (order.items || [])
    .map((i) => `<li>${i.name} × ${i.quantity} — ₹${i.price * i.quantity}</li>`)
    .join("");
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #7c3aed;">New Order Received!</h2>
      <p><b>Order #${order.orderId}</b> — ₹${order.total}</p>
      <p><b>Customer:</b> ${order.shippingAddress?.fullName || ""} (${order.shippingAddress?.mobile || ""})</p>
      <ul style="color: #444; font-size: 13px;">${itemsHtml}</ul>
      <p style="color: #666; font-size: 13px;">Payment: ${order.paymentMethod?.toUpperCase()} · ${order.paymentStatus}</p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} HASHTELICOM. All rights reserved.</p>
    </div>
  `;
  return notifyAdmins(`New Order #${order.orderId} — ₹${order.total} | HASHTELICOM`, html);
};

// Pre-built OTP email template
export const sendOtpEmail = async (to, otp, purpose = "verification") => {
  const templateType = purpose?.toLowerCase()?.includes("sign")
    ? "signup"
    : purpose?.toLowerCase()?.includes("login")
    ? "login"
    : purpose?.toLowerCase()?.includes("reset")
    ? "reset"
    : "default";

  const options = getMailOptions(templateType, to, otp);
  return sendEmail({ to, subject: options.subject, html: options.html });
};

export const sendOrderConfirmationEmail = async (to, order) => {
  const subject = `Order Confirmed - #${order.orderId} | HASHTELICOM`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #7c3aed;">Thank you for your order!</h2>
      <p>Your order <b>#${order.orderId}</b> has been placed successfully at <b>HASHTELICOM</b>.</p>
      <p><b>Total:</b> ₹${order.total}</p>
      <p>You'll receive updates as your order is processed and shipped.</p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} HASHTELICOM. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

export default sendEmail;
