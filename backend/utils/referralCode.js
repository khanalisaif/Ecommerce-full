import User from "../models/user/User.model.js";

/**
 * Generates a unique 4-digit referral code (e.g. "4829").
 * If the 4-digit space runs low, gracefully expands to 5 digits.
 */
export async function generateUniqueReferralCode() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }
  // Fallback to 5-digit if all 4-digit codes collided
  return String(Math.floor(10000 + Math.random() * 90000));
}
