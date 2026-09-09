import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Define schemas inline or import models
import Category from "../models/admin/Category.model.js";
import Product from "../models/admin/Product.model.js";
import Admin from "../models/admin/Admin.model.js";
import SiteContent from "../models/admin/SiteContent.model.js";

const CATEGORIES_DATA = [
  { name: "For You", slug: "for-you", icon: "Home", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" },
  { name: "Phone", slug: "phone", icon: "Smartphone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" },
  { name: "Laptop", slug: "laptop", icon: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80" },
  { name: "Tablet", slug: "tablet", icon: "Tablet", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&q=80" },
  { name: "Tab", slug: "tab", icon: "Tablet", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80" },
  { name: "Gadget", slug: "gadget", icon: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" },
  { name: "Accessories", slug: "accessories", icon: "Package", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80" },
  { name: "Best Sellers", slug: "best-sellers", icon: "Flame", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&q=80" },
  { name: "New Arrivals", slug: "new-arrivals", icon: "Sparkles", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&q=80" },
  { name: "For Him", slug: "for-him", icon: "User", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "For Her", slug: "for-her", icon: "PersonStanding", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&q=80" },
  { name: "Couples", slug: "couples", icon: "Heart", image: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=200&q=80" },
  { name: "For-Couples", slug: "for-couples", icon: "Heart", image: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=200&q=80" },
  { name: "Wellness", slug: "wellness", icon: "Flower2", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&q=80" },
  { name: "Oil", slug: "oil", icon: "Droplet", image: "https://images.unsplash.com/photo-1608248597359-593630f9a2ce?w=200&q=80" },
  { name: "Gift Sets", slug: "gift-sets", icon: "Gift", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&q=80" },
];

const RAW_PRODUCTS = [
  // ── PHONES ──
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    categorySlug: "phone",
    price: 134900,
    originalPrice: 159999,
    description: "Titanium design, A17 Pro chip, 48MP main camera with 5x optical zoom, Action button, and USB-C with USB 3 speeds.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"
    ],
    colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    sizes: ["256GB", "512GB", "1TB"],
    stock: 25,
    rating: 4.9,
    reviews: 420,
    isBestSeller: true,
    isNewArrival: true,
    badge: "Bestseller",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    categorySlug: "phone",
    price: 129999,
    originalPrice: 154999,
    description: "Galaxy AI is here. 200MP camera, built-in S Pen, Snapdragon 8 Gen 3, and flat 6.8 inch Dynamic AMOLED 2X display.",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80"
    ],
    colors: ["Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"],
    sizes: ["256GB", "512GB", "1TB"],
    stock: 30,
    rating: 4.8,
    reviews: 310,
    isBestSeller: true,
    badge: "Popular",
  },
  {
    name: "OnePlus 12 5G",
    brand: "OnePlus",
    categorySlug: "phone",
    price: 64999,
    originalPrice: 79999,
    description: "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 2K 120Hz ProXDR Display, and 100W SUPERVOOC charging.",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"
    ],
    colors: ["Silky Black", "Flowy Emerald"],
    sizes: ["256GB", "512GB"],
    stock: 45,
    rating: 4.7,
    reviews: 185,
    isBestSeller: false,
    isNewArrival: true,
    badge: "New",
  },
  {
    name: "Google Pixel 8 Pro",
    brand: "Google",
    categorySlug: "phone",
    price: 84999,
    originalPrice: 99999,
    description: "The all-pro phone engineered by Google. Google Tensor G3, immersive 6.7-inch display, and advanced AI photo editing.",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"
    ],
    colors: ["Obsidian", "Porcelain", "Bay Blue"],
    sizes: ["128GB", "256GB"],
    stock: 20,
    rating: 4.6,
    reviews: 140,
    isBestSeller: false,
  },

  // ── LAPTOPS ──
  {
    name: "MacBook Air M2 13-inch",
    brand: "Apple",
    categorySlug: "laptop",
    price: 99999,
    originalPrice: 119999,
    description: "Strikingly thin design, 13.6-inch Liquid Retina display, 18-hour battery life, 1080p FaceTime HD camera, and MagSafe charging.",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"
    ],
    colors: ["Midnight", "Starlight", "Space Gray", "Silver"],
    sizes: ["8GB / 256GB", "16GB / 512GB"],
    stock: 20,
    rating: 4.9,
    reviews: 512,
    isBestSeller: true,
    badge: "Bestseller",
  },
  {
    name: "Dell Inspiron 15 3000",
    brand: "Dell",
    categorySlug: "laptop",
    price: 45999,
    originalPrice: 59999,
    description: "Intel Core i5 12th Gen, 15.6 inch FHD 120Hz display, 16GB RAM, 512GB SSD, Windows 11 + MS Office included.",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"
    ],
    colors: ["Carbon Black", "Platinum Silver"],
    sizes: ["15.6\" FHD 16GB/512GB"],
    stock: 35,
    rating: 4.5,
    reviews: 210,
    isBestSeller: false,
  },
  {
    name: "HP Pavilion x360 2-in-1",
    brand: "HP",
    categorySlug: "laptop",
    price: 62999,
    originalPrice: 79999,
    description: "Touchscreen convertible laptop with Intel Core i5, 16GB DDR4, 512GB SSD, B&O audio, and HP Rechargeable MPP2.0 Tilt Pen.",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"
    ],
    colors: ["Natural Silver", "Warm Gold"],
    sizes: ["14\" FHD Touch"],
    stock: 28,
    rating: 4.6,
    reviews: 145,
    isBestSeller: false,
  },
  {
    name: "Lenovo IdeaPad Slim 5",
    brand: "Lenovo",
    categorySlug: "laptop",
    price: 54999,
    originalPrice: 69999,
    description: "AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 14 inch WUXGA IPS display with 100% sRGB and military grade durability.",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80"
    ],
    colors: ["Cloud Grey", "Abyss Blue"],
    sizes: ["14\" IPS 16GB/512GB"],
    stock: 22,
    rating: 4.5,
    reviews: 98,
    isBestSeller: false,
  },

  // ── TABLETS ──
  {
    name: "iPad Air 5th Gen M1",
    brand: "Apple",
    categorySlug: "tablet",
    price: 59900,
    originalPrice: 74999,
    description: "Apple M1 chip, 10.9-inch Liquid Retina display with True Tone, 12MP Ultra Wide front camera with Center Stage, and USB-C.",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80"
    ],
    colors: ["Space Gray", "Blue", "Purple", "Starlight", "Pink"],
    sizes: ["64GB Wi-Fi", "256GB Wi-Fi"],
    stock: 30,
    rating: 4.8,
    reviews: 320,
    isBestSeller: true,
    badge: "Popular",
  },
  {
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    categorySlug: "tablet",
    price: 74999,
    originalPrice: 89999,
    description: "Dynamic AMOLED 2X screen, IP68 water and dust resistant, S Pen included in the box, and Snapdragon 8 Gen 2 for Galaxy.",
    images: [
      "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80"
    ],
    colors: ["Graphite", "Beige"],
    sizes: ["128GB Wi-Fi", "256GB 5G"],
    stock: 25,
    rating: 4.7,
    reviews: 175,
    isBestSeller: false,
    isNewArrival: true,
  },

  // ── GADGETS & AUDIO ──
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    categorySlug: "gadget",
    price: 24990,
    originalPrice: 34990,
    description: "Industry-leading noise canceling with two processors and 8 microphones. Magnificent audio quality, up to 30 hours battery.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80"
    ],
    colors: ["Black", "Silver", "Midnight Blue"],
    sizes: ["Over-Ear"],
    stock: 40,
    rating: 4.9,
    reviews: 890,
    isBestSeller: true,
    badge: "Bestseller",
  },
  {
    name: "AirPods Pro 2nd Gen USB-C",
    brand: "Apple",
    categorySlug: "gadget",
    price: 19900,
    originalPrice: 26900,
    description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and MagSafe Case with USB-C.",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80"
    ],
    colors: ["White"],
    sizes: ["In-Ear TWS"],
    stock: 50,
    rating: 4.8,
    reviews: 1240,
    isBestSeller: true,
    badge: "Bestseller",
  },
  {
    name: "JBL Charge 5 Portable Speaker",
    brand: "JBL",
    categorySlug: "gadget",
    price: 13499,
    originalPrice: 19999,
    description: "Bold JBL Original Pro Sound, separate tweeter and dual passive radiators, 20 hours playtime, and built-in powerbank.",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80"
    ],
    colors: ["Black", "Blue", "Red", "Squad Green", "Teal"],
    sizes: ["Portable"],
    stock: 35,
    rating: 4.7,
    reviews: 310,
    isBestSeller: false,
  },

  // ── ACCESSORIES ──
  {
    name: "Anker 65W GaN Fast Charger",
    brand: "Anker",
    categorySlug: "accessories",
    price: 1999,
    originalPrice: 3499,
    description: "Compact 3-port wall charger (2 USB-C + 1 USB-A) with GaN II technology. Fast charge phone, tablet, and laptop simultaneously.",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80"
    ],
    colors: ["Black", "White"],
    sizes: ["65W 3-Port"],
    stock: 80,
    rating: 4.8,
    reviews: 460,
    isBestSeller: true,
    badge: "Popular",
  },
  {
    name: "Spigen Rugged Armor Case",
    brand: "Spigen",
    categorySlug: "accessories",
    price: 899,
    originalPrice: 1499,
    description: "Carbon fiber design with Air Cushion Technology for shock absorption. Raised lip protects screen and cameras.",
    images: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80"
    ],
    colors: ["Matte Black"],
    sizes: ["iPhone 15 Pro", "iPhone 15", "Samsung S24 Ultra"],
    stock: 100,
    rating: 4.6,
    reviews: 290,
    isBestSeller: false,
  },
  {
    name: "Baseus 10000mAh Magnetic Power Bank",
    brand: "Baseus",
    categorySlug: "accessories",
    price: 1899,
    originalPrice: 2999,
    description: "Wireless magnetic fast charging power bank with 20W PD USB-C wired charging and LED battery display.",
    images: [
      "https://images.unsplash.com/photo-1609592807664-4e4bf7e99292?w=600&q=80"
    ],
    colors: ["Black", "White", "Purple"],
    sizes: ["10000mAh"],
    stock: 60,
    rating: 4.7,
    reviews: 180,
    isBestSeller: false,
  },

  // ── WELLNESS / GIFT SETS ──
  {
    name: "Forest Essentials Ayurvedic Gift Box",
    brand: "Forest Essentials",
    categorySlug: "gift-sets",
    price: 3499,
    originalPrice: 4999,
    description: "Luxurious gift box featuring facial cleanser, nourishing cream, organic body massage oil, and rose water mist.",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80"
    ],
    colors: ["Gold & Royal Blue"],
    sizes: ["Deluxe Box"],
    stock: 25,
    rating: 4.8,
    reviews: 130,
    isBestSeller: true,
    badge: "Popular",
  },
  {
    name: "Kumkumadi Night Miracle Facial Oil",
    brand: "Kama Ayurveda",
    categorySlug: "oil",
    price: 1695,
    originalPrice: 2499,
    description: "100% natural Ayurvedic night serum with saffron, lotus, and sandalwood extracts to brighten and revive skin texture.",
    images: [
      "https://images.unsplash.com/photo-1608248597359-593630f9a2ce?w=600&q=80"
    ],
    colors: ["Golden Amber"],
    sizes: ["30ml"],
    stock: 45,
    rating: 4.7,
    reviews: 215,
    isBestSeller: false,
  },
  {
    name: "Organic Ashwagandha & Stress Relief Blend",
    brand: "Kapiva",
    categorySlug: "wellness",
    price: 499,
    originalPrice: 799,
    description: "Pure KSM-66 Ashwagandha extract capsules for calm focus, sustained vitality, and deep restorative sleep.",
    images: [
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80"
    ],
    colors: ["Natural Herbal"],
    sizes: ["60 Veg Capsules"],
    stock: 75,
    rating: 4.6,
    reviews: 340,
    isBestSeller: false,
  },
];

const SITE_CONTENT_DATA = {
  site_assets: {
    logoUrl: "/logo.png",
    loginImageUrl: "/login.png",
    signupImageUrl: "/signin.png",
  },
  topbar_settings: {
    announcementEnabled: true,
    announcementText: "Free shipping on orders above ₹999 | Use code HASHTELI for 10% off",
    announcementBgType: "gradient",
    announcementBgColor1: "#a855f7",
    announcementBgColor2: "#ec4899",
    announcementBgColor3: "#fca5a5",
  },
  popular_searches: [
    "iPhone 15",
    "MacBook Air",
    "AirPods Pro",
    "Samsung S24",
    "Fast Charger",
    "Galaxy Tab",
    "Sony Headphones",
    "Gift Sets",
  ],
  banners: [
    {
      id: "banner-1",
      title: "Elevate Your Tech Lifestyle",
      subtitle: "Premium Devices & Essentials",
      description: "Discover genuine smartphones, laptops, audio gear, and curated accessories delivered right to your doorstep.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      buttonText: "Shop Best Sellers",
      slug: "best-sellers",
    },
    {
      id: "banner-2",
      title: "Next-Gen Audio & Gadgets",
      subtitle: "Pure Sound. No Compromise.",
      description: "Explore top noise-canceling headphones, wireless earbuds, and portable speakers at exclusive discounts.",
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
      buttonText: "Explore Gadgets",
      slug: "gadget",
    },
  ],
  collections: [
    { id: "col-1", name: "Laptop", subtitle: "Ultrabooks & Powerhouses", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", category: "Tech", slug: "laptop" },
    { id: "col-2", name: "Tablet", subtitle: "Portable Creativity & Study", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80", category: "Tech", slug: "tablet" },
    { id: "col-3", name: "Phones", subtitle: "Latest Flagships & 5G", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", category: "Mobile", slug: "phone" },
    { id: "col-4", name: "Gadgets", subtitle: "Headphones & True Wireless", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80", category: "Audio", slug: "gadget" },
    { id: "col-5", name: "Accessories", subtitle: "Chargers, Cases & Hubs", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", category: "Gear", slug: "accessories" },
  ],
  category_cards: [
    {
      id: "card-1",
      name: "Phone",
      subtitle: "Flagship 5G Smartphones",
      cta: "Explore Phones",
      styles: "40+ Models",
      sizes: "All Brands",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
      slug: "phone",
    },
    {
      id: "card-2",
      name: "Tab",
      subtitle: "Pro Tablets & Stylus Packs",
      cta: "View Tablets",
      styles: "M1 / M2 / AMOLED",
      sizes: "10\" - 13\"",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
      slug: "tablet",
    },
    {
      id: "card-3",
      name: "Laptop",
      subtitle: "Work, Code & Play Everywhere",
      cta: "Browse Laptops",
      styles: "Thin & Light",
      sizes: "13\" - 16\"",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      slug: "laptop",
    },
  ],
  feature_banners: [
    {
      id: "fb-1",
      title: "Category",
      subtitle: "Unleash Your Fantasy,\nOver the horizon.",
      buttonText: "Shop Now",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80",
      badge1: "50+ Themes",
      badge2: "Premium Quality",
      slug: "For-Her",
    },
  ],
  trust_badges: [
    { id: "tb-1", icon: "Truck", title: "Free & Fast Shipping", desc: "On all orders above ₹999 across India" },
    { id: "tb-2", icon: "RotateCcw", title: "7-Day Easy Returns", desc: "Hassle-free replacement or full refund" },
    { id: "tb-3", icon: "ShieldCheck", title: "100% Genuine Tech", desc: "Authentic warranty directly from brands" },
    { id: "tb-4", icon: "Headphones", title: "Dedicated Support", desc: "Expert assistance available 24/7" },
  ],
  footer_settings: {
    brandDescription: "HASHTELICOM is your trusted Indian destination for premium mobile electronics, computers, audio gadgets, and genuine accessories with rapid door-to-door delivery.",
    copyrightText: "© 2026 HASHTELICOM. All rights reserved.",
    social: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      youtube: "https://youtube.com",
    },
  },
  footer_shop_links: [
    { id: "fs-1", label: "Best Sellers", slug: "best-sellers" },
    { id: "fs-2", label: "Smartphones", slug: "phone" },
    { id: "fs-3", label: "Laptops & MacBooks", slug: "laptop" },
    { id: "fs-4", label: "Tablets & iPads", slug: "tablet" },
    { id: "fs-5", label: "Audio & Accessories", slug: "gadget" },
  ],
  footer_category_links: [
    { id: "fc-1", label: "Apple", slug: "phone" },
    { id: "fc-2", label: "Samsung", slug: "phone" },
    { id: "fc-3", label: "Dell & HP", slug: "laptop" },
    { id: "fc-4", label: "Sony Audio", slug: "gadget" },
    { id: "fc-5", label: "Fast Chargers", slug: "accessories" },
  ],
  pages: [
    {
      id: "page-terms",
      title: "Terms & Conditions",
      slug: "terms-and-conditions",
      content: "Welcome to HASHTELICOM. By accessing or using our store, you agree to be bound by these Terms of Service. All items sold are authentic with manufacturer warranties.",
    },
    {
      id: "page-privacy",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "We value your privacy. Your personal information, payment details, and browsing preferences are encrypted and never sold to third parties.",
    },
    {
      id: "page-shipping",
      title: "Shipping Policy",
      slug: "shipping-policy",
      content: "Orders above ₹999 qualify for free standard shipping. Most metro orders are delivered within 2-4 business days in discreet, tamper-proof packaging.",
    },
    {
      id: "page-returns",
      title: "Return & Refund Policy",
      slug: "return-policy",
      content: "We provide a 7-day return policy on eligible electronics. Items must be returned in original condition with box, accessories, and invoice.",
    },
    {
      id: "page-contact",
      title: "Contact Us",
      slug: "contact-us",
      content: "Need help? Email us at support@hashtelicom.com or reach out via our 24/7 AI shopping assistant.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "How do I track my order status?",
      answer: "Go to your Account > Orders page to view live status updates and shipment tracking details.",
    },
    {
      id: "faq-2",
      question: "What payment methods are supported?",
      answer: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, RuPay), Net Banking, and Cash on Delivery (COD).",
    },
    {
      id: "faq-3",
      question: "Are all products original with warranty?",
      answer: "Yes, every product on HASHTELICOM is 100% authentic and comes with standard brand manufacturer warranty.",
    },
    {
      id: "faq-4",
      question: "How long does shipping take?",
      answer: "Standard delivery typically takes 2 to 5 business days depending on your delivery pin code.",
    },
  ],
};

async function seed() {
  console.log("🌱 Starting HASHTELICOM database seed...");
  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB.");

  // 1. Seed or Update Admin
  const adminEmail = "hasansaifkhan0@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (existingAdmin) {
    existingAdmin.name = "Hasan Saif Khan";
    existingAdmin.password = adminPassword;
    existingAdmin.role = "super-admin";
    existingAdmin.isActive = true;
    await existingAdmin.save();
    console.log(`✅ Admin ${adminEmail} updated with active password from .env: ${adminPassword}`);
  } else {
    await Admin.create({
      name: "Hasan Saif Khan",
      email: adminEmail,
      password: adminPassword,
      role: "super-admin",
      isActive: true,
    });
    console.log(`✅ Admin ${adminEmail} created with password from .env: ${adminPassword}`);
  }

  // 2. Seed Categories
  const categoryMap = new Map();
  for (const cat of CATEGORIES_DATA) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      existing.name = cat.name;
      existing.icon = cat.icon;
      existing.image = cat.image;
      await existing.save();
      categoryMap.set(cat.slug, existing);
    } else {
      const created = await Category.create({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
      });
      categoryMap.set(cat.slug, created);
    }
  }
  console.log(`✅ Seeded ${categoryMap.size} categories.`);

  // 3. Seed Products
  let productCount = 0;
  for (const p of RAW_PRODUCTS) {
    let catDoc = categoryMap.get(p.categorySlug);
    if (!catDoc) {
      catDoc = categoryMap.get("phone") || Array.from(categoryMap.values())[0];
    }

    const existingProduct = await Product.findOne({ name: p.name });
    if (existingProduct) {
      existingProduct.brand = p.brand.toUpperCase();
      existingProduct.brandName = p.brand;
      existingProduct.category = catDoc._id;
      existingProduct.categorySlug = catDoc.slug;
      existingProduct.price = p.price;
      existingProduct.originalPrice = p.originalPrice;
      existingProduct.description = p.description;
      existingProduct.images = p.images;
      existingProduct.colors = p.colors;
      existingProduct.sizes = p.sizes;
      existingProduct.stock = p.stock;
      existingProduct.rating = p.rating;
      existingProduct.reviews = p.reviews;
      existingProduct.isBestSeller = !!p.isBestSeller;
      existingProduct.isNewArrival = !!p.isNewArrival;
      existingProduct.badge = p.badge || "";
      existingProduct.isActive = true;
      await existingProduct.save();
    } else {
      await Product.create({
        name: p.name,
        brand: p.brand.toUpperCase(),
        brandName: p.brand,
        category: catDoc._id,
        categorySlug: catDoc.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        description: p.description,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        stock: p.stock,
        rating: p.rating,
        reviews: p.reviews,
        isBestSeller: !!p.isBestSeller,
        isNewArrival: !!p.isNewArrival,
        badge: p.badge || "",
        isActive: true,
      });
    }
    productCount++;
  }
  console.log(`✅ Seeded ${productCount} products.`);

  // 4. Seed SiteContent
  for (const [key, value] of Object.entries(SITE_CONTENT_DATA)) {
    await SiteContent.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  }
  console.log("✅ Seeded all CMS SiteContent keys (banners, collections, category_cards, topbar, footer, pages, faqs).");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("👉 Admin Login: email: hasansaifkhan0@gmail.com | password: Admin@123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
