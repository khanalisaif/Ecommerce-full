// Generates a 6-digit numeric OTP and its expiry timestamp
export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes
  return { otp, expiresAt };
};

export const isOtpExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
};

export default { generateOtp, isOtpExpired };
