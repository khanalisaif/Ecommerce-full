import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import SiteContent from "../../models/admin/SiteContent.model.js";

// Whitelist of recognized keys — keeps the store from silently accumulating
// typos as new "content types". Add new keys here as the admin panel grows.
export const ALLOWED_KEYS = [
  "site_assets",
  "topbar_settings",
  "popular_searches",
  "footer_settings",
  "footer_shop_links",
  "footer_category_links",
  "pages",
  "faqs",
  "banners",
  "collections",
  "category_cards",
  "feature_banners",
  "trust_badges",
  "category_configs",
];

const assertKnownKey = (key) => {
  if (!ALLOWED_KEYS.includes(key)) {
    throw new ApiError(400, `Unknown content key: ${key}`);
  }
};

// @route GET /api/content/:key  (public — storefront + admin panel both read from here)
export const getContent = asyncHandler(async (req, res) => {
  const { key } = req.params;
  assertKnownKey(key);

  const doc = await SiteContent.findOne({ key });
  res.status(200).json(new ApiResponse(200, { key, value: doc ? doc.value : null }, "Content fetched"));
});

// @route GET /api/content  (public — fetch every known key in one call, for initial app load)
export const getAllContent = asyncHandler(async (req, res) => {
  const docs = await SiteContent.find({ key: { $in: ALLOWED_KEYS } });
  const map = {};
  for (const key of ALLOWED_KEYS) map[key] = null;
  docs.forEach((d) => { map[d.key] = d.value; });

  res.status(200).json(new ApiResponse(200, { content: map }, "All content fetched"));
});

// @route PUT /api/admin/content/:key  (admin only)
export const setContent = asyncHandler(async (req, res) => {
  const { key } = req.params;
  assertKnownKey(key);

  const { value } = req.body;
  if (value === undefined) throw new ApiError(400, "value is required in the request body");

  const doc = await SiteContent.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  res.status(200).json(new ApiResponse(200, { key, value: doc.value }, "Content updated"));
});
