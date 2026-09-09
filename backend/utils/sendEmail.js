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
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-size: 13px; color: #334155;">
          <b>${item.name}</b> ${item.color || item.size ? `<span style="color:#64748b; font-size:12px;">(${[item.color, item.size].filter(Boolean).join(", ")})</span>` : ""}
        </td>
        <td style="padding: 10px 0; text-align: center; font-size: 13px; color: #64748b;">×${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-size: 13px; font-weight: bold; color: #334155;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">🎉 Thank You for Your Order!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Your order has been placed and is being prepared.</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #334155;"><b>Order ID:</b> #${order.orderId}</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #334155;"><b>Payment:</b> ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus?.toUpperCase()})</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; color: #64748b;">
            <th style="padding-bottom: 8px;">ITEM</th>
            <th style="padding-bottom: 8px; text-align: center;">QTY</th>
            <th style="padding-bottom: 8px; text-align: right;">PRICE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="border-top: 2px solid #e2e8f0; padding-top: 12px; text-align: right;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1e293b;">Total Amount: <span style="color: #7c3aed;">₹${(order.total || 0).toLocaleString("en-IN")}</span></p>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; ${new Date().getFullYear()} HASHTELICOM. All rights reserved.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 1. Security Alert Email (New login / password reset)
 */
export const sendSecurityAlertEmail = async (to, { userName, eventType = "New Login", time, ip, userAgent }) => {
  const brandName = "HASHTELICOM";
  const subject = `Security Alert: ${eventType} detected on your account | ${brandName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: #fef2f2; color: #ef4444; border-radius: 50%; padding: 12px 14px; font-size: 26px; margin-bottom: 8px;">🛡️</div>
        <h2 style="color: #1e293b; margin: 0; font-size: 22px;">Security Alert</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Important account security update</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hi <b>${userName || to}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        We detected a <b>${eventType}</b> on your ${brandName} account.
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #7c3aed; padding: 14px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 6px;"><b>Activity:</b> ${eventType}</p>
        <p style="margin: 0 0 6px;"><b>Time:</b> ${time || new Date().toLocaleString("en-IN")}</p>
        ${ip ? `<p style="margin: 0 0 6px;"><b>IP Address:</b> ${ip}</p>` : ""}
        ${userAgent ? `<p style="margin: 0;"><b>Device:</b> ${userAgent}</p>` : ""}
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        <b>Was this you?</b> If you initiated this activity, no further action is needed.
      </p>
      <p style="color: #ef4444; font-size: 13px; line-height: 1.5;">
        <b>If this wasn't you:</b> Please change your password immediately and contact our support team.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">
        You are receiving this security email because Security Alerts are active for your account.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 2. Order Status Update Email (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
 */
export const sendOrderStatusUpdateEmail = async (to, { userName, orderId, status, total, items = [] }) => {
  const brandName = "HASHTELICOM";
  const subject = `Order #${orderId} Update: Status is now ${status} | ${brandName}`;

  const statusColors = {
    Pending: { bg: "#f1f5f9", text: "#475569", icon: "⏳" },
    Processing: { bg: "#fef3c7", text: "#b45309", icon: "⚙️" },
    Shipped: { bg: "#dbeafe", text: "#1d4ed8", icon: "🚚" },
    Delivered: { bg: "#dcfce7", text: "#15803d", icon: "✅" },
    Cancelled: { bg: "#fee2e2", text: "#b91c1c", icon: "❌" },
  };
  const currentBadge = statusColors[status] || statusColors.Processing;

  const itemsList = items
    .slice(0, 4)
    .map((item) => `<li style="margin-bottom: 4px;">${item.name} (Qty: ${item.quantity})</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #7c3aed; margin: 0; font-size: 22px;">Order Status Update</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Your order #${orderId} has a new status</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hi <b>${userName || "Customer"}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Your order <b>#${orderId}</b> is now:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; background: ${currentBadge.bg}; color: ${currentBadge.text}; font-size: 18px; font-weight: bold; padding: 10px 24px; border-radius: 999px;">
          ${currentBadge.icon} ${status}
        </span>
      </div>
      ${
        itemsList
          ? `<div style="background: #f8fafc; padding: 14px 18px; border-radius: 8px; margin-bottom: 18px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #475569;">Items in this order:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">${itemsList}</ul>
            </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; font-size: 14px; color: #334155; margin-bottom: 16px;">
        <span><b>Total Amount:</b> ₹${(total || 0).toLocaleString("en-IN")}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">
        You can view live updates and track your delivery anytime in your <b>My Orders</b> dashboard.
      </p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">
        You received this email because Order Updates are enabled for your account.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 3. Review Reminder Email (Triggered when order is delivered)
 */
export const sendReviewReminderEmail = async (to, { userName, orderId, items = [] }) => {
  const brandName = "HASHTELICOM";
  const subject = `How did you like your purchase? Review Order #${orderId} | ${brandName}`;
  const firstItem = items[0] || {};
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 32px;">⭐ ⭐ ⭐ ⭐ ⭐</span>
        <h2 style="color: #1e293b; margin: 10px 0 0; font-size: 22px;">How Was Your Experience?</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Your feedback helps others make better choices!</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hi <b>${userName || "Customer"}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Your order <b>#${orderId}</b> was delivered recently. We would love to hear what you think about your new purchase${firstItem.name ? ` (<b>${firstItem.name}</b>)` : ""}!
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/account" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 28px; border-radius: 999px; display: inline-block;">
          Write a Review
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">
        You received this email because Review Reminders are enabled for your account.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 4. Wishlist Price Drop Alert Email
 */
export const sendWishlistPriceDropEmail = async (to, { userName, product, oldPrice, newPrice }) => {
  const brandName = "HASHTELICOM";
  const subject = `Price Drop Alert: ${product.name} is now on sale! | ${brandName}`;
  const savings = Math.max(0, oldPrice - newPrice);
  const savePercent = oldPrice > 0 ? Math.round((savings / oldPrice) * 100) : 0;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 32px;">🔥</span>
        <h2 style="color: #ec4899; margin: 6px 0 0; font-size: 22px;">Price Drop on Your Wishlist!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">An item in your wishlist just dropped in price</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hi <b>${userName || "Customer"}</b>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Great news! <b>${product.name}</b> that you saved is now available at a special discounted price!
      </p>
      <div style="border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; background: #faf5ff; text-align: center;">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-height: 160px; max-width: 100%; object-fit: contain; border-radius: 8px; margin-bottom: 12px;" />` : ""}
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #1e293b;">${product.name}</h3>
        <div style="font-size: 20px; font-weight: bold; color: #7c3aed;">
          ₹${Number(newPrice).toLocaleString("en-IN")}
          <span style="font-size: 14px; color: #94a3b8; text-decoration: line-through; margin-left: 8px;">₹${Number(oldPrice).toLocaleString("en-IN")}</span>
          ${savePercent > 0 ? `<span style="font-size: 12px; background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 999px; margin-left: 8px;">${savePercent}% OFF</span>` : ""}
        </div>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/product/${product.id || product._id}" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 28px; border-radius: 999px; display: inline-block;">
          Buy Now Before Stock Ends
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">
        You received this email because Wishlist Alerts are active for your account.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 5. News & Updates Broadcast Email (Admin triggered to all subscribed users)
 */
export const sendNewsBroadcastEmail = async (to, { title, message, bannerUrl, actionLink }) => {
  const brandName = "HASHTELICOM";
  const subject = `${title} | ${brandName} News`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">HASHTELICOM</h2>
        <p style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">News & Updates</p>
      </div>
      ${bannerUrl ? `<div style="text-align: center; margin: 0 0 22px;"><img src="${bannerUrl}" alt="${title}" border="0" style="display: block; width: 100%; max-width: 500px; max-height: 280px; object-fit: cover; border-radius: 10px; margin: 0 auto;" /></div>` : ""}
      <h3 style="color: #1e293b; font-size: 20px; margin: 0 0 14px;">${title}</h3>
      <div style="color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-line; margin-bottom: 24px;">
        ${message}
      </div>
      ${
        actionLink
          ? `<div style="text-align: center; margin: 24px 0;">
              <a href="${actionLink}" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 12px 30px; border-radius: 999px; display: inline-block;">
                Learn More
              </a>
            </div>`
          : ""
      }
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.4;">
        You are receiving this update because News & Updates is enabled in your notification preferences.<br/>
        To update your preferences, visit <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/account" style="color: #7c3aed; text-decoration: underline;">Account Settings</a>.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * 6. Coupon & Special Offer Email (Admin triggered to all users with offers enabled)
 */
export const sendCouponOfferEmail = async (to, { coupon }) => {
  const brandName = "HASHTELICOM";
  const discountText =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `Flat ₹${coupon.discountValue} OFF`;
  const subject = `Special Deal: ${discountText} with code ${coupon.code}! | ${brandName}`;

  const validUntilStr = coupon.validUntil
    ? new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Limited Time";

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 32px;">🎁</span>
        <h2 style="color: #ec4899; margin: 6px 0 0; font-size: 24px;">Exclusive Offer for You!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Enjoy special discounts on your next purchase</p>
      </div>
      <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: center;">
        ${coupon.description || `Use the exclusive coupon code below to unlock <b>${discountText}</b> at checkout.`}
      </p>

      <!-- Coupon Voucher Box -->
      <div style="border: 2px dashed #a855f7; background: #faf5ff; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: bold; color: #a855f7; text-transform: uppercase; letter-spacing: 1.5px;">YOUR COUPON CODE</p>
        
        <div style="margin: 12px 0;">
          <a href="${clientUrl}/checkout?coupon=${coupon.code}" style="text-decoration: none; display: inline-block;" title="Click to auto-apply at checkout">
            <span style="display: inline-block; background: #7c3aed; color: #ffffff; font-size: 26px; font-family: monospace, Courier, sans-serif; font-weight: bold; letter-spacing: 4px; padding: 12px 30px; border-radius: 8px; border: 1px solid #6d28d9; user-select: all; -webkit-user-select: all;">
              ${coupon.code}
            </span>
          </a>
        </div>

        <p style="margin: 10px 0 0; font-size: 12px; color: #7c3aed; font-weight: bold;">
          📋 Tap/Click code to select & copy
        </p>

        <p style="margin: 14px 0 0; font-size: 14px; font-weight: bold; color: #1e293b;">
          ${discountText} ${coupon.minOrderAmount > 0 ? `on orders above ₹${coupon.minOrderAmount.toLocaleString("en-IN")}` : ""}
        </p>
        <p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">
          Valid until: <b>${validUntilStr}</b>
        </p>
      </div>

      <!-- Auto Apply CTA Button -->
      <div style="text-align: center; margin: 26px 0;">
        <a href="${clientUrl}/checkout?coupon=${coupon.code}" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 999px; display: inline-block; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);">
          ⚡ Click to Auto-Apply & Shop Now
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.4;">
        You received this email because Offers & Discounts is enabled in your account.<br/>
        Manage your notification preferences anytime in your <a href="${clientUrl}/account" style="color: #7c3aed;">Account Settings</a>.<br/>
        &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail({ to, subject, html });
};

export default sendEmail;

