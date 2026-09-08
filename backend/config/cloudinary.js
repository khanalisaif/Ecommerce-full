// Cloudinary setup for product/category/banner image uploads
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file buffer/path to Cloudinary.
 * @param {string} filePath - local temp file path (from multer diskStorage)
 * @param {string} folder - cloudinary folder name
 */
export const uploadToCloudinary = (filePath, folder = "hashtelicom") => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });
};

export const deleteFromCloudinary = (publicId) => {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Accepts whatever the frontend sends for an image field: a base64 data URI
 * (freshly picked/compressed file), an already-hosted https URL (unchanged
 * on edit), or empty. Uploads only the data URIs; passes hosted URLs through
 * untouched so re-saving a form without changing its image doesn't re-upload.
 */
export const resolveImage = async (input, folder = "hashtelicom") => {
  if (!input) return "";
  if (typeof input === "string" && input.startsWith("data:")) {
    const result = await uploadToCloudinary(input, folder);
    return result.secure_url;
  }
  return input; // already a URL (or something else the caller passed through)
};

/**
 * Same as resolveImage but for an array of image strings (product galleries).
 */
export const resolveImages = async (inputs = [], folder = "hashtelicom") => {
  if (!Array.isArray(inputs)) return [];
  const resolved = await Promise.all(inputs.map((img) => resolveImage(img, folder)));
  return resolved.filter(Boolean);
};

export default cloudinary;
