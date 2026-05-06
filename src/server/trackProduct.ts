// src/server/trackProduct.ts — TanStack Start Server Function
// This runs on the server (locally via Nitro, on Vercel as serverless)
// The frontend calls this directly — no manual /api/ route needed.

import { createServerFn } from "@tanstack/start";

// ─── Environment ──────────────────────────────────────────────────────────────

const getKey = () => process.env.RAPIDAPI_KEY ?? "";
const getAmazonHost = () =>
  process.env.RAPIDAPI_AMAZON_HOST ?? "real-time-amazon-data.p.rapidapi.com";
const getProductSearchHost = () =>
  process.env.RAPIDAPI_PRODUCT_SEARCH_HOST ??
  "real-time-product-search.p.rapidapi.com";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface TrackedResult {
  productName: string;
  brand: string;
  image: string;
  category: string;
  sourcePlatform: string;
  results: PlatformResult[];
  fromAPI: boolean;
  error?: string;
}

interface AmazonResult {
  title: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  url: string;
}

// ─── URL parsing helpers ──────────────────────────────────────────────────────

function detectSourcePlatform(url: string): string {
  if (url.includes("nykaa")) return "nykaa";
  if (url.includes("amazon")) return "amazon";
  if (url.includes("flipkart")) return "flipkart";
  if (url.includes("myntra")) return "myntra";
  if (url.includes("blinkit")) return "blinkit";
  return "other";
}

function extractSlugFromURL(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);
    const slug = segments.find(
      (s) =>
        s.length > 3 &&
        !s.startsWith("dp") &&
        !s.startsWith("p") &&
        !/^\d+$/.test(s)
    );
    return (slug ?? segments[segments.length - 1] ?? "product").replace(
      /[-_]+/g,
      " "
    );
  } catch {
    return url
      .replace(/https?:\/\//, "")
      .split("/")
      .pop()
      ?.replace(/[-_]+/g, " ")
      ?? "product";
  }
}

const KNOWN_BRANDS: Record<string, string> = {
  mac: "MAC Cosmetics",
  maybelline: "Maybelline",
  lakme: "Lakmé",
  loreal: "L'Oréal",
  nykaa: "Nykaa Cosmetics",
  "ray-ban": "Ray-Ban",
  rayban: "Ray-Ban",
  oakley: "Oakley",
  vogue: "Vogue Eyewear",
  fastrack: "Fastrack",
  titan: "Titan Eyewear",
  "john jacobs": "John Jacobs",
  lenskart: "Lenskart",
  vincent: "Vincent Chase",
  nike: "Nike",
  boat: "boAt",
  samsung: "Samsung",
  apple: "Apple",
  oneplus: "OnePlus",
  colorbar: "Colorbar",
  sugar: "SUGAR Cosmetics",
  nars: "NARS",
  huda: "Huda Beauty",
  "kay beauty": "Kay Beauty",
  neutrogena: "Neutrogena",
  cetaphil: "Cetaphil",
  "the ordinary": "The Ordinary",
  minimalist: "Minimalist",
  "dot & key": "Dot & Key",
};

function detectBrand(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, brand] of Object.entries(KNOWN_BRANDS)) {
    if (lower.includes(key)) return brand;
  }
  return name.split(" ").slice(0, 2).join(" ");
}

function detectCategory(name: string): string {
  const l = name.toLowerCase();
  if (/lipstick|lip\s?gloss|lip\s?liner|lip\s?balm/.test(l)) return "Lips";
  if (/nail\s?(polish|color|paint|lacquer)/.test(l)) return "Nails";
  if (/sunglass|aviator|wayfarer|eyewear|frame|spectacle/.test(l))
    return "Sunglasses";
  if (/foundation|concealer|primer|bb\s?cream|cc\s?cream/.test(l))
    return "Foundation";
  if (/serum|moistur|cleanser|face\s?wash|toner|sunscreen|spf/.test(l))
    return "Skincare";
  if (/shampoo|conditioner|hair\s?(oil|mask|serum|spray)/.test(l))
    return "Hair Care";
  if (/perfume|eau\s?de|fragrance|deodorant|body\s?mist/.test(l))
    return "Fragrance";
  if (/phone|laptop|tablet|headphone|earbuds|speaker|charger|cable/.test(l))
    return "Electronics";
  if (/shirt|dress|jeans|kurta|saree|jacket|hoodie|t-shirt/.test(l))
    return "Clothing";
  if (/toy|lego|doll|puzzle|game/.test(l)) return "Toys";
  return "Beauty & Personal Care";
}

// ─── RapidAPI #1: Real-Time Amazon Data (primary) ────────────────────────────

async function searchAmazonDirect(
  query: string
): Promise<AmazonResult | null> {
  const key = getKey();
  const host = getAmazonHost();
  if (!key) return null;

  try {
    const res = await fetch(
      `https://${host}/search?query=${encodeURIComponent(query)}&country=IN&page=1&sort_by=RELEVANCE`,
      {
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": host,
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.data?.products ?? [];
    if (!products.length) return null;

    const product =
      products.find((p: any) => {
        const price = parseFloat(
          String(p.product_price ?? "0").replace(/[^0-9.]/g, "")
        );
        return price > 0;
      }) ?? products[0];

    const price =
      parseFloat(
        String(product?.product_price ?? "0").replace(/[^0-9.]/g, "")
      ) || 0;

    return {
      title: product?.product_title ?? query,
      image: product?.product_photo ?? product?.product_photos?.[0] ?? "",
      price,
      rating: parseFloat(product?.product_star_rating ?? "4.2") || 4.2,
      reviews:
        parseInt(
          String(product?.product_num_ratings ?? "500").replace(/[^0-9]/g, ""),
          10
        ) || 500,
      url:
        product?.product_url ??
        `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── RapidAPI #2: Real-Time Product Search (fallback) ────────────────────────

async function searchAmazonFallback(
  query: string
): Promise<AmazonResult | null> {
  const key = getKey();
  const host = getProductSearchHost();
  if (!key) return null;

  try {
    const res = await fetch(
      `https://${host}/search?q=${encodeURIComponent(query + " site:amazon.in")}&country=IN&language=en`,
      {
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": host,
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const products = data?.data?.products ?? data?.products ?? [];
    if (!products.length) return null;

    const amazonProduct =
      products.find((p: any) =>
        (p.product_page_url ?? p.url ?? "").includes("amazon.in")
      ) ?? products[0];

    const rawPrice =
      amazonProduct?.typical_price_range?.[0] ??
      amazonProduct?.offer?.price ??
      amazonProduct?.price ??
      "0";
    const price = parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;

    return {
      title: amazonProduct?.product_title ?? amazonProduct?.title ?? query,
      image:
        amazonProduct?.product_photos?.[0] ?? amazonProduct?.image ?? "",
      price,
      rating: parseFloat(amazonProduct?.product_rating ?? "4.2") || 4.2,
      reviews:
        parseInt(amazonProduct?.product_num_ratings ?? "500", 10) || 500,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── Combined Amazon search ──────────────────────────────────────────────────

async function searchAmazon(query: string): Promise<AmazonResult | null> {
  const direct = await searchAmazonDirect(query);
  if (direct && direct.price > 0) return direct;
  return searchAmazonFallback(query);
}

// ─── Nykaa search ────────────────────────────────────────────────────────────

async function searchNykaa(
  query: string
): Promise<{ price: number; url: string } | null> {
  const key = getKey();
  const host = getProductSearchHost();
  if (!key) return null;

  try {
    const res = await fetch(
      `https://${host}/search?q=${encodeURIComponent(query + " site:nykaa.com")}&country=IN&language=en`,
      {
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": host,
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
    const price =
      parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;

    return {
      price,
      url:
        nykaaProduct?.product_page_url ??
        `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}`,
    };
  } catch {
    return null;
  }
}

// ─── Fallback helpers ────────────────────────────────────────────────────────

function deterministicPrice(url: string, category: string): number {
  const RANGES: Record<string, [number, number]> = {
    Lips: [299, 1999],
    Nails: [99, 499],
    Sunglasses: [1999, 14999],
    Foundation: [299, 1799],
    Skincare: [249, 1499],
    "Hair Care": [199, 999],
    Fragrance: [499, 4999],
    Electronics: [499, 29999],
    Clothing: [399, 4999],
    Toys: [299, 2999],
    "Beauty & Personal Care": [199, 1999],
  };
  let hash = 0;
  for (let i = 0; i < url.length; i++)
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
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
  for (let i = 0; i < url.length; i++)
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;

  const variation = (seed: number) =>
    Math.round(basePrice * ((Math.abs(hash * seed) % 12 - 4) / 100));

  const q = encodeURIComponent(query);
  const make = (
    platform: string,
    priceOffset: number,
    delivery: number,
    inStock: boolean,
    rating: number,
    reviews: number,
    deliveryTime: string,
    urlBase: string
  ): PlatformResult => {
    const price = Math.max(Math.round(basePrice + priceOffset), 49);
    const gst = Math.round(price * 0.18);
    return {
      platform,
      price,
      deliveryFee: delivery,
      gst,
      total: price + delivery + gst,
      inStock,
      rating,
      reviews,
      url: urlBase,
      delivery: deliveryTime,
    };
  };

  return [
    make("nykaa", 0, 0, true, 4.3, 2841, "2-4 days", `https://www.nykaa.com/search/result/?q=${q}`),
    make("amazon", variation(7), 40, true, 4.5, 12430, "1-2 days", `https://www.amazon.in/s?k=${q}`),
    make("flipkart", variation(13), 0, Math.abs(hash % 3) !== 0, 4.1, 8920, "2-3 days", `https://www.flipkart.com/search?q=${q}`),
    make("myntra", variation(19), 0, true, 4.2, 3510, "3-5 days", `https://www.myntra.com/search?rawQuery=${q}`),
    make("blinkit", variation(23) + Math.round(basePrice * 0.05), 25, Math.abs(hash % 4) !== 0, 3.9, 420, "10 mins", `https://blinkit.com/s/?q=${q}`),
  ].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.total - b.total;
  });
}

const CATEGORY_IMAGES: Record<string, string> = {
  Lips: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=70",
  Nails: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=70",
  Sunglasses: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=70",
  Foundation: "https://images.unsplash.com/photo-1631214524020-7b6d6cb84d23?w=400&q=70",
  Skincare: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400&q=70",
  "Hair Care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=70",
  Fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=70",
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70",
  Clothing: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=70",
  Toys: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=70",
  "Beauty & Personal Care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70",
};

// ─── Core logic (shared by server function + Vercel handler) ─────────────────

async function trackProductCore(url: string): Promise<TrackedResult> {
  const slug = extractSlugFromURL(url);
  const cleanName = slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  const sourcePlatform = detectSourcePlatform(url);
  const brand = detectBrand(cleanName);
  const category = detectCategory(cleanName);

  // Parallel API calls
  const [amazonData, nykaaData] = await Promise.all([
    searchAmazon(cleanName),
    searchNykaa(cleanName),
  ]);

  const fromAPI = !!(amazonData || nykaaData);

  let basePrice: number;
  if (amazonData?.price && amazonData.price > 0) {
    basePrice = amazonData.price;
  } else {
    basePrice = deterministicPrice(url, category);
  }

  const results = buildFallbackResults(url, category, basePrice, cleanName);

  // Patch real API prices
  if (amazonData?.price && amazonData.price > 0) {
    const entry = results.find((r) => r.platform === "amazon");
    if (entry) {
      entry.price = amazonData.price;
      entry.gst = Math.round(amazonData.price * 0.18);
      entry.total = amazonData.price + entry.deliveryFee + entry.gst;
      entry.rating = amazonData.rating;
      entry.reviews = amazonData.reviews;
      entry.url = amazonData.url;
    }
  }

  if (nykaaData?.price && nykaaData.price > 0) {
    const entry = results.find((r) => r.platform === "nykaa");
    if (entry) {
      entry.price = nykaaData.price;
      entry.gst = Math.round(nykaaData.price * 0.18);
      entry.total = nykaaData.price + entry.deliveryFee + entry.gst;
      entry.url = nykaaData.url;
    }
  }

  // Re-sort
  results.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.total - b.total;
  });

  const productName = amazonData?.title ?? cleanName;
  const image =
    amazonData?.image ||
    CATEGORY_IMAGES[category] ||
    CATEGORY_IMAGES["Beauty & Personal Care"];

  return {
    productName,
    brand,
    image,
    category,
    sourcePlatform,
    results,
    fromAPI,
  };
}

// ─── TanStack Start Server Function ──────────────────────────────────────────
// Called directly from the frontend — works locally (Nitro) AND on Vercel.

export const trackProduct = createServerFn({ method: "GET" })
  .validator((data: { url: string }) => {
    if (!data.url || !data.url.trim()) {
      throw new Error("url parameter is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    return trackProductCore(data.url);
  });
