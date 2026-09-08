import mongoose from "mongoose";

// A single flexible collection for every "CMS-ish" piece of admin-editable
// content that doesn't need relational querying (banners, collections,
// category cards, feature banners, trust badges, topbar/footer settings,
// popular searches, pages, faqs, site logo/asset URLs, category filter
// configs). Each row is one key -> one JSON blob, matching exactly what the
// admin dashboard already builds client-side, so no field-by-field mapping
// is needed between frontend state and the database.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export default SiteContent;
