import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URL);
  const newBanner = [
    {
      id: "fb-1",
      title: "Roleplay Costumes",
      subtitle: "Unleash Your Fantasy.\nOwn the Moment.",
      buttonText: "Shop Costumes",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80",
      badge1: "50+ Themes",
      badge2: "Premium Quality",
      slug: "for-her",
    },
  ];
  await mongoose.connection.db.collection("sitecontents").updateOne(
    { key: "feature_banners" },
    { $set: { value: newBanner, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log("Successfully updated feature_banners in MongoDB!");
  const res = await mongoose.connection.db.collection("sitecontents").findOne({ key: "feature_banners" });
  console.log("Current value in DB:", JSON.stringify(res.value, null, 2));
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
