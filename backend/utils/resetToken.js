import crypto from "crypto";

/**
 * Generates a random URL-safe token plus its SHA-256 hash.
 * The raw token is emailed to the user (never stored); the hash is what we
 * persist and compare against, so a leaked database never exposes usable
 * reset links.
 */
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { rawToken, hashedToken, expiresAt };
};

export const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

export default { generateResetToken, hashToken };
