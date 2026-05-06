// api/track.ts  — Vercel Edge/Serverless Function
// Place this file at:  /api/track.ts  in your project root
//
// Required environment variables (set in Vercel dashboard):
//   RAPIDAPI_KEY            — your RapidAPI key (free tier works)
//
// APIs used:
//   • Real-Time Product Search  (covers Amazon IN results)
//   • Nykaa product search      (via RapidAPI)
//
// The function returns a unified TrackedResult JSON that your
// existing track.tsx UI already knows how to render.

import type { VercelRequest, VercelResponse } from "@vercel/node";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformResult {
  platform: string;
  price: number;
  deliveryFee: number;
  gst: number;
  total: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  url: string;
  delivery: string;
}

interface TrackedResult {
  productName: string;
  brand: string;
  image: string;
  category: string;
  sourcePlatform: string;
  results: PlatformResult[];
  fromAPI: boolean;
  error?: string;
}

// ─── URL parsing helpers ──────────────────────────────────────────────────────

function detectSourcePlatform(url: string): string {
  if (url.includes("nykaa"))    return "nykaa";
  if (url.includes("amazon"))   return "amazon";
  if (url.includes("flipkart")) return "flipkart";
  if (url.includes("myntra"))   return "myntra";
  if (url.includes("blinkit"))  return "blinkit";
  return "amazon";
}

function extractSlugFromURL(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname
      .replace(/^\//, "")
      .replace(/\/p\/.*$/, "")
      .replace(/\/dp\/.*$/, "")
      .replace(/\/itm.*$/, "")
      .split("/")
      .filter(Boolean);
    return path.reduce((a, b) => (a.length >= b.length ? a : b), "");
  } catch {
    return url;
  }
}

const KNOWN_BRANDS: Record<string, string> = {
  mac: "MAC", maybelline: "Maybelline", lakme: "Lakmé", nars: "NARS",
  "ray-ban": "Ray-Ban", rayban: "Ray-Ban", nike: "Nike", adidas: "Adidas",
  lego: "LEGO", barbie: "Barbie", mcaffeine: "mCaffeine", loreal: "L'Oréal",
  nivea: "Nivea", dove: "Dove", mamaearth: "Mamaearth", biotique: "Biotique",
  plum: "Plum", sugar: "SUGAR", colorbar: "Colorbar",
  boat: "boAt", samsung: "Samsung", apple: "Apple", sony: "Sony",
  himalaya: "Himalaya", cetaphil: "Cetaphil", neutrogena: "Neutrogena",
  olay: "Olay", garnier: "Garnier", wow: "WOW", beardo: "Beardo",
  revlon: "Revlon", ponds: "Pond's",
};

function detectBrand(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, brand] of Object.entries(KNOWN_BRANDS)) {
    if (lower.includes(key)) return brand;
  }
  return name.split(" ")[0] || "Brand";
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Lips:        ["lipstick", "lip gloss", "lip balm", "lip liner", "lip color"],
  Nails:       ["nail polish", "nail color", "nail paint", "nail art"],
  Sunglasses:  ["sunglasses", "eyewear", "aviator", "wayfarer", "cat-eye"],
  Foundation:  ["foundation", "bb cream", "cc cream", "concealer"],
  Skincare:    ["face wash", "moisturizer", "serum", "sunscreen", "toner"],
  "Hair Care": ["shampoo", "conditioner", "hair oil", "hair color", "hair mask"],
  Fragrance:   ["perfume", "deodorant", "cologne", "body mist"],
  Electronics: ["phone", "earbuds", "headphone", "charger", "watch"],
  Clothing:    ["shirt", "dress", "jeans", "kurta", "jacket"],
  Toys:        ["toy", "lego", "barbie", "doll", "puzzle"],
};

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => lower.includes(kw))) return cat;
  }
  return "Beauty & Personal Care";
}

// ─── Amazon result shape ──────────────────────────────────────────────────────

interface AmazonResult {
  title: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  url: string;
}

// ─── RapidAPI #1: Real-Time Amazon Data (primary — direct Amazon scrape) ─────

async function searchAmazonDirect(query: string): Promise<AmazonResult | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const res = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=IN&page=1&sort_by=RELEVANCE`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.data?.products ?? [];

    if (!products.length) return null;

    // Pick the first product with a valid price
    const product = products.find((p: any) => {
      const price = parseFloat(String(p.product_price ?? "0").replace(/[^0-9.]/g, ""));
      return price > 0;
    }) ?? products[0];

    const price = parseFloat(
      String(product?.product_price ?? "0").replace(/[^0-9.]/g, "")
    ) || 0;

    return {
      title:   product?.product_title ?? query,
      image:   product?.product_photo ?? product?.product_photos?.[0] ?? "",
      price,
      rating:  parseFloat(product?.product_star_rating ?? "4.2") || 4.2,
      reviews: parseInt(String(product?.product_num_ratings ?? "500").replace(/[^0-9]/g, ""), 10) || 500,
      url:     product?.product_url ?? `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── RapidAPI #2: Real-Time Product Search (fallback — Google Shopping) ───────

async function searchAmazonFallback(query: string): Promise<AmazonResult | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const res = await fetch(
      `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(query + " site:amazon.in")}&country=IN&language=en`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.data?.products ?? data?.products ?? [];

    if (!products.length) return null;

    const amazonProduct = products.find((p: any) =>
      (p.product_page_url ?? p.url ?? "").includes("amazon.in")
    ) ?? products[0];

    const rawPrice =
      amazonProduct?.typical_price_range?.[0] ??
      amazonProduct?.offer?.price ??
      amazonProduct?.price ??
      "0";

    const price = parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;

    return {
      title:   amazonProduct?.product_title ?? amazonProduct?.title ?? query,
      image:   amazonProduct?.product_photos?.[0] ?? amazonProduct?.image ?? "",
      price,
      rating:  parseFloat(amazonProduct?.product_rating ?? "4.2") || 4.2,
      reviews: parseInt(amazonProduct?.product_num_ratings ?? "500", 10) || 500,
      url:     `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── Combined Amazon search: tries direct API first, then fallback ───────────

async function searchAmazonViaRapidAPI(query: string): Promise<AmazonResult | null> {
  // Try the direct Amazon Data API first (more accurate prices + product URLs)
  const direct = await searchAmazonDirect(query);
  if (direct && direct.price > 0) return direct;

  // Fall back to generic product search
  return searchAmazonFallback(query);
}

// ─── RapidAPI: Nykaa product search ──────────────────────────────────────────

async function searchNykaaViaRapidAPI(query: string): Promise<{
  price: number;
  url: string;
} | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    // Nykaa doesn't have an official RapidAPI — we search via Google Shopping
    const res = await fetch(
      `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(query + " site:nykaa.com")}&country=IN&language=en`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.data?.products ?? data?.products ?? [];

    const nykaaProduct = products.find((p: any) =>
      (p.product_page_url ?? p.url ?? "").includes("nykaa")
    );

    if (!nykaaProduct) return null;

    const rawPrice =
      nykaaProduct?.offer?.price ?? nykaaProduct?.price ?? "0";
    const price = parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;

    return {
      price,
      url: nykaaProduct?.product_page_url ?? `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── Smart deterministic fallback (same as your existing simulateSearch) ──────

function deterministicPrice(url: string, category: string): number {
  const RANGES: Record<string, [number, number]> = {
    Lips: [299, 1999], Nails: [99, 499], Sunglasses: [1999, 14999],
    Foundation: [299, 1799], Skincare: [249, 1499], "Hair Care": [199, 999],
    Fragrance: [499, 4999], Electronics: [499, 29999], Clothing: [399, 4999],
    Toys: [299, 2999], "Beauty & Personal Care": [199, 1999],
  };
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  const [lo, hi] = RANGES[category] ?? [199, 1999];
  return lo + Math.abs(hash % (hi - lo));
}

function buildFallbackResults(
  url: string,
  category: string,
  basePrice: number,
  query: string
): PlatformResult[] {
  let hash = 0;
  for (let i = 0; i < url.length; i++) hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;

  const variation = (seed: number) =>
    Math.round(basePrice * ((Math.abs(hash * seed) % 12 - 4) / 100));

  const q = encodeURIComponent(query);
  const make = (
    platform: string, priceOffset: number, delivery: number,
    inStock: boolean, rating: number, reviews: number, deliveryTime: string, urlBase: string
  ): PlatformResult => {
    const price = Math.max(Math.round(basePrice + priceOffset), 49);
    const gst   = Math.round(price * 0.18);
    return {
      platform, price, deliveryFee: delivery, gst,
      total: price + delivery + gst,
      inStock, rating, reviews,
      url: urlBase,
      delivery: deliveryTime,
    };
  };

  return [
    make("nykaa",    0,             0,  true,                     4.3, 2841,  "2-4 days",  `https://www.nykaa.com/search/result/?q=${q}`),
    make("amazon",   variation(7),  40, true,                     4.5, 12430, "1-2 days",  `https://www.amazon.in/s?k=${q}`),
    make("flipkart", variation(13), 0,  Math.abs(hash % 3) !== 0, 4.1, 8920,  "2-3 days",  `https://www.flipkart.com/search?q=${q}`),
    make("myntra",   variation(19), 0,  true,                     4.2, 3510,  "3-5 days",  `https://www.myntra.com/search?rawQuery=${q}`),
    make("blinkit",  variation(23) + Math.round(basePrice * 0.05), 25, Math.abs(hash % 4) !== 0, 3.9, 420, "10 mins", `https://blinkit.com/s/?q=${q}`),
  ].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.total - b.total;
  });
}

// ─── Category fallback images ─────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  Lips:         "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=70",
  Nails:        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=70",
  Sunglasses:   "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=70",
  Foundation:   "https://images.unsplash.com/photo-1631214524020-7b6d6cb84d23?w=400&q=70",
  Skincare:     "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400&q=70",
  "Hair Care":  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=70",
  Fragrance:    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=70",
  Electronics:  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70",
  Clothing:     "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=70",
  Toys:         "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=70",
  "Beauty & Personal Care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70",
};

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url: string =
    (req.method === "POST"
      ? (req.body as any)?.url
      : req.query.url) ?? "";

  if (!url.trim()) {
    return res.status(400).json({ error: "url parameter is required" });
  }

  // 1. Parse the URL
  const slug           = extractSlugFromURL(url);
  const cleanName      = slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  const sourcePlatform = detectSourcePlatform(url);
  const brand          = detectBrand(cleanName);
  const category       = detectCategory(cleanName);

  // 2. Search RapidAPI (Amazon first — best coverage for IN products)
  const [amazonData, nykaaData] = await Promise.all([
    searchAmazonViaRapidAPI(cleanName),
    searchNykaaViaRapidAPI(cleanName),
  ]);

  const fromAPI = !!(amazonData || nykaaData);

  // 3. Determine base price
  let basePrice: number;
  if (amazonData?.price && amazonData.price > 0) {
    basePrice = amazonData.price;
  } else {
    basePrice = deterministicPrice(url, category);
  }

  // 4. Build per-platform results
  // Start with fallback, then patch in real API prices where available
  const results = buildFallbackResults(url, category, basePrice, cleanName);

  if (amazonData?.price && amazonData.price > 0) {
    const amazonEntry = results.find((r) => r.platform === "amazon");
    if (amazonEntry) {
      amazonEntry.price   = amazonData.price;
      amazonEntry.gst     = Math.round(amazonData.price * 0.18);
      amazonEntry.total   = amazonData.price + amazonEntry.deliveryFee + amazonEntry.gst;
      amazonEntry.rating  = amazonData.rating;
      amazonEntry.reviews = amazonData.reviews;
      amazonEntry.url     = amazonData.url;
    }
  }

  if (nykaaData?.price && nykaaData.price > 0) {
    const nykaaEntry = results.find((r) => r.platform === "nykaa");
    if (nykaaEntry) {
      nykaaEntry.price = nykaaData.price;
      nykaaEntry.gst   = Math.round(nykaaData.price * 0.18);
      nykaaEntry.total = nykaaData.price + nykaaEntry.deliveryFee + nykaaEntry.gst;
      nykaaEntry.url   = nykaaData.url;
    }
  }

  // Re-sort after patching real prices
  results.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.total - b.total;
  });

  // 5. Product name + image
  const productName = amazonData?.title ?? cleanName;
  const image       = amazonData?.image || CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Beauty & Personal Care"];

  const payload: TrackedResult = {
    productName,
    brand,
    image,
    category,
    sourcePlatform,
    results,
    fromAPI,
  };

  return res.status(200).json(payload);
}