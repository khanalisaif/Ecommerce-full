// Navigation Links & Categories — kept as fallback for legacy imports
export const navLinks = []
export const categories = []
export const bestSellers = []

// CATEGORY_CONFIG: dynamic sidebar data per route slug
export const CATEGORY_CONFIG = {
  default: {
    title: 'All Products',
    sidebarCategories: [
      { name: 'Clothing & Lingerie', sub: [
        { name: 'Dresses', count: 15352 }, { name: 'Tops', count: 8245 },
        { name: 'Nightwear', count: 6125 }, { name: 'Lingerie Sets', count: 9876 },
      ]},
      { name: 'Accessories', sub: [{ name: 'Stockings', count: 1234 }, { name: 'Garter Belts', count: 876 }]},
      { name: 'Wellness', sub: [{ name: 'Massage Oils', count: 543 }, { name: 'Supplements', count: 321 }]},
    ],
    brands: ['Zivame', 'Clovia', 'Amante', 'Lelo', 'PrettySecrets', 'Marks & Spencer'],
    colors: ['Black', 'White', 'Pink', 'Purple', 'Beige', 'Red'],
    sizes: [{ label: 'XS', count: 1245 }, { label: 'S', count: 4568 }, { label: 'M', count: 7889 }, { label: 'L', count: 6452 }, { label: 'XL', count: 3245 }, { label: 'XXL', count: 1025 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Laptop: {
    title: 'Laptops',
    sidebarCategories: [
      { name: 'Laptops', sub: [{ name: 'Gaming Laptops', count: 312 }, { name: 'Ultrabooks', count: 245 }, { name: 'Business Laptops', count: 189 }, { name: 'Budget Laptops', count: 423 }, { name: '2-in-1 Laptops', count: 98 }]},
      { name: 'Accessories', sub: [{ name: 'Laptop Bags', count: 562 }, { name: 'Laptop Stands', count: 234 }, { name: 'Cooling Pads', count: 178 }]},
    ],
    brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Microsoft'],
    colors: ['Silver', 'Space Gray', 'Black', 'White', 'Gold'],
    sizes: [{ label: '13"', count: 345 }, { label: '14"', count: 678 }, { label: '15.6"', count: 892 }, { label: '16"', count: 234 }, { label: '17"', count: 156 }],
    discounts: ['10% and above', '15% and above', '20% and above', '25% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Tablet: {
    title: 'Tablets',
    sidebarCategories: [
      { name: 'Tablets', sub: [{ name: 'Android Tablets', count: 456 }, { name: 'iPads', count: 123 }, { name: 'Windows Tablets', count: 89 }, { name: 'Kids Tablets', count: 67 }, { name: 'E-Readers', count: 145 }]},
      { name: 'Accessories', sub: [{ name: 'Tablet Covers', count: 789 }, { name: 'Stylus Pens', count: 234 }, { name: 'Keyboard Cases', count: 178 }]},
    ],
    brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Huawei', 'Amazon'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Blue', 'Green', 'Pink'],
    sizes: [{ label: '7"', count: 123 }, { label: '8"', count: 234 }, { label: '10"', count: 456 }, { label: '11"', count: 345 }, { label: '12.9"', count: 189 }],
    discounts: ['10% and above', '15% and above', '20% and above', '25% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'For-Couples': {
    title: 'For Couples',
    sidebarCategories: [
      { name: 'Couple Kits', sub: [{ name: 'Starter Kits', count: 234 }, { name: 'Premium Sets', count: 178 }, { name: 'Anniversary Gifts', count: 456 }, { name: 'Travel Sets', count: 89 }]},
      { name: 'Accessories', sub: [{ name: 'Massage Oils', count: 345 }, { name: 'Candles', count: 123 }, { name: 'Dice & Games', count: 67 }]},
    ],
    brands: ['Durex', 'Lelo', 'We-Vibe', 'Lovehoney', 'Womanizer'],
    colors: ['Red', 'Pink', 'Purple', 'Black', 'Rose Gold'],
    sizes: [{ label: 'Small Kit', count: 234 }, { label: 'Medium Kit', count: 456 }, { label: 'Large Kit', count: 178 }, { label: 'Travel Size', count: 89 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Gadget: {
    title: 'Gadgets',
    sidebarCategories: [
      { name: 'Smart Gadgets', sub: [{ name: 'Smart Watches', count: 678 }, { name: 'Earbuds', count: 892 }, { name: 'Power Banks', count: 456 }, { name: 'Smart Speakers', count: 234 }, { name: 'Fitness Trackers', count: 345 }]},
      { name: 'Audio', sub: [{ name: 'Headphones', count: 567 }, { name: 'Bluetooth Speakers', count: 345 }, { name: 'DAC/Amps', count: 89 }]},
      { name: 'Cameras', sub: [{ name: 'Action Cameras', count: 123 }, { name: 'Webcams', count: 234 }]},
    ],
    brands: ['Sony', 'JBL', 'Bose', 'Apple', 'Samsung', 'OnePlus', 'boAt'],
    colors: ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green'],
    sizes: [{ label: 'Mini', count: 234 }, { label: 'Standard', count: 678 }, { label: 'Pro', count: 345 }, { label: 'Max', count: 189 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Accessories: {
    title: 'Accessories',
    sidebarCategories: [
      { name: 'Mobile Accessories', sub: [{ name: 'Phone Cases', count: 1234 }, { name: 'Screen Guards', count: 567 }, { name: 'Chargers', count: 789 }, { name: 'Cables', count: 456 }, { name: 'Mounts', count: 234 }]},
      { name: 'Laptop Accessories', sub: [{ name: 'Mouse', count: 345 }, { name: 'Keyboard', count: 234 }, { name: 'Hub/Docking', count: 178 }]},
    ],
    brands: ['Anker', 'Baseus', 'Ugreen', 'Belkin', 'Spigen', 'ESR', 'Logitech'],
    colors: ['Black', 'White', 'Clear', 'Blue', 'Red', 'Pink', 'Green'],
    sizes: [{ label: 'Universal', count: 567 }, { label: 'iPhone 15', count: 234 }, { label: 'Samsung S24', count: 189 }, { label: 'Pixel 8', count: 123 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Phone: {
    title: 'Smartphones',
    sidebarCategories: [
      { name: 'Smartphones', sub: [{ name: 'Flagship Phones', count: 234 }, { name: 'Mid-Range Phones', count: 678 }, { name: 'Budget Phones', count: 892 }, { name: 'Foldable Phones', count: 45 }, { name: 'Rugged Phones', count: 89 }]},
      { name: 'By OS', sub: [{ name: 'Android', count: 1234 }, { name: 'iOS / iPhone', count: 345 }]},
    ],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Vivo', 'Oppo', 'Realme'],
    colors: ['Midnight Black', 'Pearl White', 'Ocean Blue', 'Forest Green', 'Titanium', 'Pink'],
    sizes: [{ label: '5.5"', count: 123 }, { label: '6.1"', count: 456 }, { label: '6.7"', count: 678 }, { label: '6.9"', count: 234 }, { label: '7.6" Fold', count: 89 }],
    discounts: ['5% and above', '10% and above', '15% and above', '20% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Tab: {
    title: 'Tablets & iPads',
    sidebarCategories: [
      { name: 'Tab Categories', sub: [{ name: 'iPads', count: 234 }, { name: 'Android Tabs', count: 567 }, { name: 'Windows Tabs', count: 123 }, { name: 'E-Ink Readers', count: 89 }]},
      { name: 'By Use', sub: [{ name: 'For Students', count: 345 }, { name: 'For Professionals', count: 234 }, { name: 'For Kids', count: 178 }, { name: 'For Drawing', count: 123 }]},
    ],
    brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Amazon', 'Huawei'],
    colors: ['Silver', 'Space Gray', 'Gold', 'Starlight', 'Blue', 'Green'],
    sizes: [{ label: '7-8"', count: 234 }, { label: '10-11"', count: 678 }, { label: '12-13"', count: 345 }, { label: '14"+', count: 89 }],
    discounts: ['10% and above', '15% and above', '20% and above', '25% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'For-You': {
    title: 'For You',
    sidebarCategories: [
      { name: 'Personal Care', sub: [{ name: 'Skincare', count: 678 }, { name: 'Haircare', count: 456 }, { name: 'Wellness Kits', count: 234 }]},
      { name: 'Self Love', sub: [{ name: 'Relaxation Sets', count: 345 }, { name: 'Bath & Body', count: 567 }, { name: 'Massage Tools', count: 189 }]},
    ],
    brands: ['Dove', 'Mamaearth', 'WOW', 'Himalaya', 'Forest Essentials', 'Biotique'],
    colors: ['Natural', 'White', 'Green', 'Pink', 'Purple', 'Orange'],
    sizes: [{ label: 'Travel 50ml', count: 234 }, { label: 'Regular 150ml', count: 678 }, { label: 'Large 300ml', count: 345 }, { label: 'XL 500ml', count: 189 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'For-Him': {
    title: 'For Him',
    sidebarCategories: [
      { name: "Men's Grooming", sub: [{ name: 'Beard Care', count: 456 }, { name: 'Shaving Kits', count: 345 }, { name: 'Hair Styling', count: 234 }, { name: 'Face Wash', count: 567 }, { name: 'Perfumes', count: 789 }]},
      { name: "Men's Wellness", sub: [{ name: 'Supplements', count: 234 }, { name: 'Fitness Accessories', count: 345 }, { name: 'Relaxation', count: 178 }]},
    ],
    brands: ['Man Matters', 'Beardo', 'Bombay Shaving', 'Park Avenue', 'Axe', 'Gillette'],
    colors: ['Charcoal', 'Navy', 'Black', 'White', 'Grey', 'Brown'],
    sizes: [{ label: 'S', count: 345 }, { label: 'M', count: 678 }, { label: 'L', count: 892 }, { label: 'XL', count: 567 }, { label: 'XXL', count: 234 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'For-Her': {
    title: 'For Her',
    sidebarCategories: [
      { name: "Women's Collection", sub: [{ name: 'Lingerie', count: 1234 }, { name: 'Dresses', count: 892 }, { name: 'Tops & Tunics', count: 567 }, { name: 'Nightwear', count: 456 }, { name: 'Swimwear', count: 234 }]},
      { name: "Women's Beauty", sub: [{ name: 'Skincare', count: 789 }, { name: 'Makeup', count: 567 }, { name: 'Fragrances', count: 345 }]},
    ],
    brands: ['Zivame', 'Clovia', 'PrettySecrets', 'Nykaa', 'Marks & Spencer', 'Amante'],
    colors: ['Pink', 'Purple', 'White', 'Black', 'Beige', 'Red', 'Gold'],
    sizes: [{ label: 'XS', count: 345 }, { label: 'S', count: 678 }, { label: 'M', count: 892 }, { label: 'L', count: 567 }, { label: 'XL', count: 234 }, { label: 'XXL', count: 123 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Couples: {
    title: 'Couples',
    sidebarCategories: [
      { name: 'Couple Kits', sub: [{ name: 'Starter Kits', count: 234 }, { name: 'Premium Sets', count: 178 }, { name: 'Anniversary Gifts', count: 456 }, { name: 'Travel Sets', count: 89 }]},
      { name: 'Accessories', sub: [{ name: 'Massage Oils', count: 345 }, { name: 'Candles', count: 123 }, { name: 'Couple Games', count: 67 }]},
    ],
    brands: ['Durex', 'Lelo', 'We-Vibe', 'Lovehoney', 'Womanizer'],
    colors: ['Red', 'Pink', 'Purple', 'Black', 'Rose Gold'],
    sizes: [{ label: 'Small Kit', count: 234 }, { label: 'Medium Kit', count: 456 }, { label: 'Large Kit', count: 178 }, { label: 'Travel Size', count: 89 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Wellness: {
    title: 'Wellness',
    sidebarCategories: [
      { name: 'Mind & Body', sub: [{ name: 'Yoga & Meditation', count: 345 }, { name: 'Supplements', count: 678 }, { name: 'Sleep Aids', count: 234 }, { name: 'Stress Relief', count: 456 }]},
      { name: 'Fitness', sub: [{ name: 'Resistance Bands', count: 234 }, { name: 'Foam Rollers', count: 178 }, { name: 'Weights', count: 345 }]},
    ],
    brands: ['Himalaya', 'Patanjali', 'Kapiva', 'HealthVit', 'GNC', 'Boldfit'],
    colors: ['Natural', 'Green', 'White', 'Blue', 'Orange'],
    sizes: [{ label: '30 Caps', count: 345 }, { label: '60 Caps', count: 678 }, { label: '90 Caps', count: 456 }, { label: 'Family Pack', count: 234 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  Oil: {
    title: 'Oils & Serums',
    sidebarCategories: [
      { name: 'Body Oils', sub: [{ name: 'Massage Oils', count: 456 }, { name: 'Essential Oils', count: 345 }, { name: 'Aromatherapy', count: 234 }, { name: 'Hair Oils', count: 678 }]},
      { name: 'Skincare Oils', sub: [{ name: 'Face Oils', count: 234 }, { name: 'Serums', count: 456 }, { name: 'Vitamin C Oils', count: 189 }]},
    ],
    brands: ['Kama Ayurveda', 'Forest Essentials', 'Khadi', 'WOW', 'Juicy Chemistry', 'Himalaya'],
    colors: ['Golden', 'Clear', 'Amber', 'Green', 'Brown'],
    sizes: [{ label: '30ml', count: 234 }, { label: '50ml', count: 678 }, { label: '100ml', count: 456 }, { label: '200ml', count: 234 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'Gift-Sets': {
    title: 'Gift Sets',
    sidebarCategories: [
      { name: 'Gift Categories', sub: [{ name: 'Birthday Gifts', count: 678 }, { name: 'Anniversary Gifts', count: 456 }, { name: 'Festive Hampers', count: 345 }, { name: 'Couple Gifts', count: 234 }, { name: 'Self-Love Kits', count: 189 }]},
      { name: 'By Budget', sub: [{ name: 'Under Rs.999', count: 456 }, { name: 'Rs.999-Rs.2499', count: 345 }, { name: 'Above Rs.2499', count: 234 }]},
    ],
    brands: ['Dove', 'Forest Essentials', 'Kama Ayurveda', 'Lelo', 'Durex', 'The Body Shop'],
    colors: ['Red', 'Gold', 'Pink', 'Purple', 'White', 'Silver'],
    sizes: [{ label: 'Mini Set', count: 456 }, { label: 'Standard Set', count: 678 }, { label: 'Premium Set', count: 345 }, { label: 'Luxury Hamper', count: 189 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'New-Arrivals': {
    title: 'New Arrivals',
    sidebarCategories: [
      { name: 'New This Week', sub: [{ name: 'Electronics', count: 89 }, { name: 'Accessories', count: 123 }, { name: 'Wellness', count: 67 }, { name: 'Clothing', count: 145 }]},
      { name: 'New This Month', sub: [{ name: 'Top Picks', count: 234 }, { name: 'Editor Choices', count: 178 }, { name: 'Trending', count: 345 }]},
    ],
    brands: ['Apple', 'Samsung', 'Lelo', 'Zivame', 'Sony', 'OnePlus', 'Nykaa'],
    colors: ['Black', 'White', 'Blue', 'Green', 'Pink', 'Gold'],
    sizes: [{ label: 'XS', count: 89 }, { label: 'S', count: 234 }, { label: 'M', count: 456 }, { label: 'L', count: 345 }, { label: 'XL', count: 178 }],
    discounts: ['5% and above', '10% and above', '20% and above', '30% and above'],
    ratings: ['4 and above', '3 and above', '2 and above'],
  },
  'Best-Sellers': {
    title: 'Best Sellers',
    sidebarCategories: [
      { name: 'Top Categories', sub: [{ name: '#1 Electronics', count: 234 }, { name: '#2 Wellness', count: 345 }, { name: '#3 Accessories', count: 456 }, { name: '#4 Clothing', count: 678 }, { name: '#5 Gift Sets', count: 234 }]},
      { name: 'By Rating', sub: [{ name: '5 Star Products', count: 123 }, { name: '4.5+ Star Products', count: 345 }, { name: '4+ Star Products', count: 678 }]},
    ],
    brands: ['Apple', 'Samsung', 'Lelo', 'Zivame', 'Sony', 'boAt', 'Nykaa', 'OnePlus'],
    colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Pink', 'Purple'],
    sizes: [{ label: 'XS', count: 234 }, { label: 'S', count: 456 }, { label: 'M', count: 678 }, { label: 'L', count: 567 }, { label: 'XL', count: 345 }],
    discounts: ['10% and above', '20% and above', '30% and above', '40% and above'],
    ratings: ['5 Star Only', '4 and above', '3 and above'],
  },
}

// Product generator helper
const makeProd = (count, cfg) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${cfg.slug}-product-${i + 1}`,
    brand: (cfg.brands[i % cfg.brands.length]).toUpperCase(),
    brand_name: cfg.brands[i % cfg.brands.length],
    name: cfg.names[i % cfg.names.length],
    price: cfg.prices[i % cfg.prices.length],
    originalPrice: cfg.origPrices[i % cfg.origPrices.length],
    discount: cfg.discounts[i % cfg.discounts.length],
    sizes: cfg.sizesStr[i % cfg.sizesStr.length],
    stockInfo: i % 4 === 0 ? 'Only 1 left' : i % 3 === 0 ? 'Only 3 left' : 'In Stock',
    isAssured: i % 2 === 0,
    image: cfg.images[i % cfg.images.length],
    color: cfg.colors[i % cfg.colors.length],
    rating: [3.5, 4, 4.2, 4.5, 5][i % 5],
    category: cfg.slug,
  }))

const LP_IMGS = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80',
]
const TB_IMGS = [
  'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
  'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=400&q=80',
]
const PH_IMGS = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
]
const GD_IMGS = [
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
]
const AC_IMGS = [
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  'https://images.unsplash.com/photo-1549887534-f2cb8579a020?w=400&q=80',
  'https://images.unsplash.com/photo-1576091160550-112173faf246?w=400&q=80',
]
const WL_IMGS = [
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
]
const CP_IMGS = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&q=80',
]

export const CATEGORY_PRODUCTS = {
  Laptop: makeProd(48, { slug: 'Laptop', brands: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'], names: ['Inspiron 15 3000', 'Pavilion x360', 'IdeaPad Slim 5', 'MacBook Air M2', 'VivoBook 15', 'Aspire 5'], prices: [45999, 62999, 39999, 99999, 49999, 35999], origPrices: [59999, 79999, 54999, 119999, 64999, 49999], discounts: ['23% OFF', '21% OFF', '27% OFF', '17% OFF', '23% OFF', '27% OFF'], sizesStr: ['13" FHD', '14" FHD', '15.6" FHD', '16" Retina', '15.6" HD', '14" HD'], images: LP_IMGS, colors: ['Silver', 'Space Gray', 'Black', 'White', 'Gold', 'Blue'] }),
  Tablet: makeProd(48, { slug: 'Tablet', brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Amazon', 'Huawei'], names: ['iPad Air 5th Gen', 'Galaxy Tab S9', 'Tab P12 Pro', 'Surface Pro 9', 'Fire HD 10', 'MatePad 11'], prices: [59900, 74999, 29999, 134999, 14999, 39999], origPrices: [74999, 89999, 44999, 159999, 19999, 54999], discounts: ['20% OFF', '16% OFF', '33% OFF', '15% OFF', '25% OFF', '27% OFF'], sizesStr: ['11" Retina', '11" AMOLED', '12.6" IPS', '13" PixelSense', '10.1" IPS', '11" IPS'], images: TB_IMGS, colors: ['Space Gray', 'Silver', 'Gold', 'Blue', 'Green', 'Pink'] }),
  'For-Couples': makeProd(40, { slug: 'For-Couples', brands: ['Durex', 'Lelo', 'We-Vibe', 'Lovehoney', 'Womanizer'], names: ['Couple Starter Kit', 'Premium Massage Set', 'Anniversary Gift Box', 'Travel Couple Kit', 'Luxury Intimacy Set'], prices: [999, 4999, 2499, 1499, 7999], origPrices: [1499, 7999, 3999, 2499, 11999], discounts: ['33% OFF', '38% OFF', '38% OFF', '40% OFF', '33% OFF'], sizesStr: ['Small Kit', 'Medium Kit', 'Large Kit', 'Travel Size', 'Deluxe Set'], images: CP_IMGS, colors: ['Red', 'Pink', 'Purple', 'Black', 'Rose Gold'] }),
  Gadget: makeProd(48, { slug: 'Gadget', brands: ['Sony', 'JBL', 'Bose', 'Apple', 'Samsung', 'boAt'], names: ['WH-1000XM5 Headphones', 'Charge 5 Speaker', 'QuietComfort 45', 'AirPods Pro 2', 'Galaxy Buds2 Pro', 'Rockerz 450'], prices: [24990, 13499, 29990, 19900, 11999, 1499], origPrices: [34990, 19999, 39990, 26900, 17999, 3499], discounts: ['29% OFF', '32% OFF', '25% OFF', '26% OFF', '33% OFF', '57% OFF'], sizesStr: ['Over-Ear', 'Portable', 'Over-Ear', 'In-Ear TWS', 'In-Ear TWS', 'On-Ear'], images: GD_IMGS, colors: ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green'] }),
  Accessories: makeProd(48, { slug: 'Accessories', brands: ['Anker', 'Baseus', 'Ugreen', 'Belkin', 'Spigen', 'ESR'], names: ['65W GaN Charger', 'MagSafe Phone Case', '7-in-1 USB Hub', '10000mAh Power Bank', 'Rugged Armor Case', 'HaloLock MagSafe'], prices: [1999, 899, 2499, 1499, 799, 1299], origPrices: [3499, 1499, 3999, 2499, 1499, 1999], discounts: ['43% OFF', '40% OFF', '38% OFF', '40% OFF', '47% OFF', '35% OFF'], sizesStr: ['Universal', 'iPhone 15', 'Samsung S24', 'Pixel 8', 'Universal', 'iPhone 15 Pro'], images: AC_IMGS, colors: ['Black', 'White', 'Clear', 'Blue', 'Red', 'Pink', 'Green'] }),
  Phone: makeProd(48, { slug: 'Phone', brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Vivo'], names: ['iPhone 15 Pro Max', 'Galaxy S24 Ultra', 'OnePlus 12', 'Xiaomi 14', 'Pixel 8 Pro', 'V29 Pro'], prices: [134900, 129999, 64999, 69999, 84999, 35999], origPrices: [159999, 154999, 79999, 84999, 99999, 44999], discounts: ['16% OFF', '16% OFF', '19% OFF', '17% OFF', '15% OFF', '20% OFF'], sizesStr: ['256GB', '512GB', '256GB', '256GB', '128GB', '256GB'], images: PH_IMGS, colors: ['Midnight Black', 'Pearl White', 'Ocean Blue', 'Forest Green', 'Titanium', 'Pink'] }),
  Tab: makeProd(48, { slug: 'Tab', brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'Amazon', 'Huawei'], names: ['iPad Pro M2', 'Galaxy Tab S9+', 'Tab P12 Pro', 'Surface Go 3', 'Fire Max 11', 'MatePad Pro'], prices: [89900, 99999, 39999, 59999, 19999, 49999], origPrices: [109999, 119999, 54999, 74999, 24999, 64999], discounts: ['18% OFF', '16% OFF', '27% OFF', '20% OFF', '20% OFF', '23% OFF'], sizesStr: ['12.9" ProMotion', '12.4" AMOLED', '12.6" IPS', '10.5" PixelSense', '11" IPS', '12.6" OLED'], images: TB_IMGS, colors: ['Silver', 'Space Gray', 'Gold', 'Starlight', 'Blue', 'Green'] }),
  Wellness: makeProd(40, { slug: 'Wellness', brands: ['Himalaya', 'Patanjali', 'Kapiva', 'HealthVit', 'GNC', 'Boldfit'], names: ['Ashwagandha Capsules', 'Triphala Powder', 'Shilajit Gold', 'Vitamin D3 Gummies', 'Whey Protein', 'Resistance Band Set'], prices: [299, 199, 899, 499, 2499, 699], origPrices: [499, 349, 1499, 799, 3999, 1299], discounts: ['40% OFF', '43% OFF', '40% OFF', '38% OFF', '38% OFF', '46% OFF'], sizesStr: ['60 Capsules', '500g Powder', '30 Capsules', '60 Gummies', '1kg', 'Set of 3'], images: WL_IMGS, colors: ['Natural', 'Green', 'White', 'Blue', 'Orange'] }),
  'For-You': makeProd(40, { slug: 'For-You', brands: ['Dove', 'Mamaearth', 'WOW', 'Himalaya', 'Forest Essentials', 'Biotique'], names: ['Moisturizing Body Lotion', 'Vitamin C Face Wash', 'Apple Cider Vinegar Shampoo', 'Neem Face Pack', 'Vetiver Body Wash', 'Bio Walnut Scrub'], prices: [299, 399, 599, 249, 1299, 349], origPrices: [499, 599, 849, 399, 1799, 549], discounts: ['40% OFF', '33% OFF', '29% OFF', '38% OFF', '28% OFF', '36% OFF'], sizesStr: ['150ml', '100ml', '300ml', '75g', '200ml', '75g'], images: WL_IMGS, colors: ['Natural', 'White', 'Green', 'Pink', 'Purple', 'Orange'] }),
  'For-Him': makeProd(40, { slug: 'For-Him', brands: ['Man Matters', 'Beardo', 'Bombay Shaving', 'Park Avenue', 'Axe', 'Gillette'], names: ['Beard Growth Kit', 'Complete Shaving Set', 'Hair Styling Wax', 'Men Face Wash', 'Dark Temptation Deo', 'Fusion ProShield'], prices: [599, 1299, 399, 299, 249, 499], origPrices: [999, 1999, 699, 499, 399, 799], discounts: ['40% OFF', '35% OFF', '43% OFF', '40% OFF', '38% OFF', '38% OFF'], sizesStr: ['Complete Kit', '5-Piece Set', '100g', '150ml', '150ml', 'Razor + Blades'], images: WL_IMGS, colors: ['Charcoal', 'Navy', 'Black', 'White', 'Grey', 'Brown'] }),
  'For-Her': makeProd(40, { slug: 'For-Her', brands: ['Zivame', 'Clovia', 'PrettySecrets', 'Nykaa', 'Marks & Spencer', 'Amante'], names: ['Lace Bra Set', 'Printed Nighty', 'Satin Slip Dress', 'Push-Up Bra', 'Cotton Briefs Pack', 'Padded Bralette'], prices: [1299, 899, 2499, 1799, 699, 1099], origPrices: [1999, 1499, 3999, 2999, 1199, 1799], discounts: ['35% OFF', '40% OFF', '38% OFF', '40% OFF', '42% OFF', '39% OFF'], sizesStr: ['32B', '34B', 'S, M, L', 'XS, S, M, L', 'M, L, XL', 'XS, S, M'], images: AC_IMGS, colors: ['Pink', 'Purple', 'White', 'Black', 'Beige', 'Red', 'Gold'] }),
  Couples: makeProd(40, { slug: 'Couples', brands: ['Durex', 'Lelo', 'We-Vibe', 'Lovehoney', 'Womanizer'], names: ['Couple Starter Kit', 'Premium Massage Set', 'Anniversary Gift Box', 'Travel Couple Kit', 'Luxury Intimacy Set'], prices: [999, 4999, 2499, 1499, 7999], origPrices: [1499, 7999, 3999, 2499, 11999], discounts: ['33% OFF', '38% OFF', '38% OFF', '40% OFF', '33% OFF'], sizesStr: ['Small Kit', 'Medium Kit', 'Large Kit', 'Travel Size', 'Deluxe Set'], images: CP_IMGS, colors: ['Red', 'Pink', 'Purple', 'Black', 'Rose Gold'] }),
  Oil: makeProd(40, { slug: 'Oil', brands: ['Kama Ayurveda', 'Forest Essentials', 'Khadi', 'WOW', 'Juicy Chemistry', 'Himalaya'], names: ['Brahmi Hair Oil', 'Kumkumadi Miracle Oil', 'Lavender Essential Oil', 'Vitamin C Serum', 'Rose Hip Seed Oil', 'Under Eye Cream'], prices: [695, 1695, 299, 599, 899, 399], origPrices: [999, 2499, 499, 999, 1299, 699], discounts: ['30% OFF', '32% OFF', '40% OFF', '40% OFF', '31% OFF', '43% OFF'], sizesStr: ['100ml', '30ml', '15ml', '30ml Serum', '30ml', '50ml'], images: WL_IMGS, colors: ['Golden', 'Clear', 'Amber', 'Green', 'Brown'] }),
  'Gift-Sets': makeProd(40, { slug: 'Gift-Sets', brands: ['Dove', 'Forest Essentials', 'Kama Ayurveda', 'Lelo', 'Durex', 'The Body Shop'], names: ['Birthday Pamper Kit', 'Anniversary Luxury Hamper', 'Festive Beauty Box', 'Couples Night Set', 'Self Love Kit', 'Skincare Glow Set'], prices: [799, 3499, 1999, 2499, 1299, 1799], origPrices: [1299, 4999, 2999, 3999, 1999, 2599], discounts: ['38% OFF', '30% OFF', '33% OFF', '38% OFF', '35% OFF', '31% OFF'], sizesStr: ['Small Gift', 'Medium Hamper', 'Large Hamper', 'Couple Set', 'Self Care Kit', 'Beauty Box'], images: CP_IMGS, colors: ['Red', 'Gold', 'Pink', 'Purple', 'White', 'Silver'] }),
  'New-Arrivals': makeProd(40, { slug: 'New-Arrivals', brands: ['Apple', 'Samsung', 'Lelo', 'Zivame', 'Sony', 'OnePlus'], names: ['iPhone 16 Pro', 'Galaxy S25', 'Sona 2', 'Lace Comfort Bra', 'WF-1000XM6', 'OnePlus 13'], prices: [134900, 129999, 5999, 1499, 19990, 69999], origPrices: [159999, 154999, 7999, 2499, 26990, 84999], discounts: ['16% OFF', '16% OFF', '25% OFF', '40% OFF', '26% OFF', '18% OFF'], sizesStr: ['256GB', '512GB', 'Standard', 'S, M, L', 'TWS', '256GB'], images: PH_IMGS, colors: ['Black', 'White', 'Blue', 'Green', 'Pink', 'Gold'] }),
  'Best-Sellers': makeProd(40, { slug: 'Best-Sellers', brands: ['Apple', 'Samsung', 'boAt', 'Zivame', 'Sony', 'Anker'], names: ['AirPods Pro 2', 'Galaxy Buds2 Pro', 'Rockerz 450', 'Lace Comfort Bra Set', 'WH-1000XM5', '65W GaN Charger'], prices: [19900, 11999, 1499, 1299, 24990, 1999], origPrices: [26900, 17999, 3499, 1999, 34990, 3499], discounts: ['26% OFF', '33% OFF', '57% OFF', '35% OFF', '29% OFF', '43% OFF'], sizesStr: ['TWS', 'TWS', 'On-Ear', 'S, M, L', 'Over-Ear', 'Universal'], images: GD_IMGS, colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Pink', 'Purple'] }),
}

// Banner/Hero section data
export const banners = [
  {
    id: 1,
    title: 'Elevate Your',
    subtitle: 'We here',
    description: 'Carefully curated products, confidence and well-being.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    buttonText: 'Shop Best Sellers'
  },
  {
    id: 2,
    title: 'Premium Quality',
    subtitle: 'Experience Luxury',
    description: 'Discover our exclusive collection curated for you.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    buttonText: 'Explore Collections'
  }
]

// Collections - 5-column grid (each has a slug for direct routing)
export const collections = [
  { id: 1, name: 'Laptop', subtitle: 'Explore Premium Essentials', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', category: 'Tech', slug: 'Laptop' },
  { id: 2, name: 'Tablet', subtitle: 'Designed for Pleasure', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', category: 'Tech', slug: 'Tablet' },
  { id: 3, name: 'For Couples', subtitle: 'Stronger Together, Better Intimacy', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80', category: 'Couples', slug: 'For-Couples' },
  { id: 4, name: 'Gadget', subtitle: 'The Best Mobile Accessories 2026', image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80', category: 'Gadgets', slug: 'Gadget' },
  { id: 5, name: 'Accessories', subtitle: 'Complete Your Collection', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', category: 'Accessories', slug: 'Accessories' }
]

// Search Dropdown - Popular searches
export const popularSearches = [
  'Vibrators',
  'Sports Massager',
  'Lace Lubricant',
  'Push Up Kit',
  'Seamless Gift Set'
]

// Category Cards - Large 3-column cards (Phone / Tab / Laptop) - each has a slug
export const categoryCards = [
  { id: 1, name: 'Phone', slug: 'Phone', subtitle: 'Designed for Comfort. Made to Empower.', image: 'https://images.unsplash.com/photo-1511707271537-b85faf00021e?w=600&q=80', styles: '100+ Styles', sizes: 'Sizes 30A - 44H', cta: 'Shop Phone' },
  { id: 2, name: 'Tab', slug: 'Tab', subtitle: 'Soft. Stylish. Made for Every You.', image: 'https://images.unsplash.com/photo-1519824712712-190481ab1da6?w=600&q=80', styles: '200+ Styles', sizes: 'Sizes XS - 3XL', cta: 'Shop Tab' },
  { id: 3, name: 'Laptop', slug: 'Laptop', subtitle: 'Feel Confident. Feel Irresistible.', image: 'https://images.unsplash.com/photo-1542272604-787c62002182?w=600&q=80', styles: '150+ Styles', sizes: 'Sizes XS - 3XL', cta: 'Shop Laptop' }
]
