import "dotenv/config";
import axios from "axios";

/**
 * Send OTP via SMS using PRP SMS service for HASHTELICOM.
 *
 * @param {string} phone - Phone number (10 digits)
 * @param {string} templateType - Type of OTP (signup, login, reset, verify) or exact DLT template name
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTPViaSMS = async (phone, otp, templateType = "signup") => {
  try {
    const prpSmsConfig = {
      apiUrl:
        process.env.PRP_SMS_API_URL ||
        "https://api.prpsms.biz/BulkSMSapi/keyApiSendSMS/SendSmsTemplateName",
      apiKey: process.env.PRP_SMS_API_KEY,
      sender: process.env.PRP_SMS_SENDER || "DGVAHN",
      templates: {
        signup: process.env.PRP_SMS_SIGNUP_TEMPLATE_NAME || "SignUp_OTP",
        login: process.env.PRP_SMS_LOGIN_TEMPLATE_NAME || "SignIn_OTP",
        reset: process.env.PRP_SMS_RESET_TEMPLATE_NAME || "Reset_Password_OTP",
        verify: process.env.PRP_SMS_2FA_TEMPLATE_NAME || "2FA_Verification_OTP",
      },
    };

    // Clean phone number to 10 digits
    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);

    if (!prpSmsConfig.apiKey || !prpSmsConfig.sender) {
      console.error("❌ PRP SMS config missing");
      if (process.env.NODE_ENV === "development") {
        console.log(`📱 [DEV] SMS config missing, but OTP for ${cleanPhone} is: ${otp}. Valid for 10 minutes.`);
        return true;
      }
      return false;
    }

    // Resolve template name whether a key ('signup') or a template name ('SignUp_OTP') was provided
    const templateName =
      prpSmsConfig.templates[templateType?.toLowerCase?.()] ||
      templateType ||
      prpSmsConfig.templates.signup;

    if (!templateName) {
      console.error(`❌ Template not found for: ${templateType}`);
      return false;
    }

    const smsPayload = {
      sender: prpSmsConfig.sender,
      templateName,
      smsReciever: [
        {
          mobileNo: cleanPhone,
          templateParams: String(otp),
        },
      ],
    };

    console.log("📤 [HASHTELICOM SMS] Sending SMS payload:", smsPayload);

    const response = await axios.post(prpSmsConfig.apiUrl, smsPayload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: prpSmsConfig.apiKey,
      },
      timeout: 30000,
    });

    console.log("📥 [HASHTELICOM SMS] API response:", response.data);

    if (response.data?.isSuccess === true) {
      console.log(`📱 [HASHTELICOM SMS] Sent to ${cleanPhone}`);

      return true;
    } else {
      console.error("❌ PRP SMS failed:", response.data);
      if (process.env.NODE_ENV === "development") {
        console.log(`📱 [DEV] SMS failed, but OTP for ${cleanPhone} is: ${otp}. Valid for 10 minutes.`);
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error("❌ SMS error full:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    if (process.env.NODE_ENV === "development") {
      console.log(`📱 [DEV] SMS error caught, but OTP for ${phone} is: ${otp}. Valid for 10 minutes.`);
      return true;
    }
    return false;
  }
};

/**
 * Adapter matching the existing sendOtpSms signature:
 * (mobile, templateNameOrType, otp)
 */
export const sendOtpSms = async (mobile, templateNameOrType, otp) => {
  return sendOTPViaSMS(mobile, otp, templateNameOrType);
};

export const TEMPLATES = {
  SIGNUP: process.env.PRP_SMS_SIGNUP_TEMPLATE_NAME || "SignUp_OTP",
  LOGIN: process.env.PRP_SMS_LOGIN_TEMPLATE_NAME || "SignIn_OTP",
  RESET: process.env.PRP_SMS_RESET_TEMPLATE_NAME || "Reset_Password_OTP",
  TWO_FA: process.env.PRP_SMS_2FA_TEMPLATE_NAME || "2FA_Verification_OTP",
};

export default sendOtpSms;
