import "../styles/fonts.css";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Link2,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Clock,
  Bell,
  Check,
  ChevronRight,
  Loader2,
  Star,
  Package,
  X,
  Zap,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { platforms, type PlatformKey } from "@/data/platforms";
import { formatPrice } from "@/utils/priceCalculator";
import { trackProduct } from "@/server/trackProduct";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Smart Price Tracker — SeeClear" },
      {
        name: "description",
        content:
          "Paste any product link and compare prices across Nykaa, Amazon, Flipkart, Myntra and more.",
      },
    ],
  }),
  component: TrackPage,
});

/* ---------- SIMULATED DATA ---------- */

interface TrackedResult {
  productName: string;
  brand: string;
  image: string;
  category: string;
  sourcePlatform: PlatformKey;
  fromAPI: boolean;
  results: {
    platform: PlatformKey;
    price: number;
    deliveryFee: number;
    gst: number;
    total: number;
    inStock: boolean;
    rating: number;
    reviews: number;
    url: string;
    delivery: string;
  }[];
}

const RECENT_SEARCHES = [
  {
    url: "https://www.nykaa.com/mac-retro-matte-lipstick/p/362228",
    product: "MAC Retro Matte Lipstick — Ruby Woo",
    time: "2 hours ago",
  },
  {
    url: "https://www.amazon.in/dp/B09KFGH234",
    product: "Ray-Ban Aviator Classic",
    time: "Yesterday",
  },
  {
    url: "https://www.flipkart.com/lakme-nail-color/p/itm332341",
    product: "Lakmé True Wear Nail Color — Berry",
    time: "3 days ago",
  },
];

function simulateSearch(url: string): TrackedResult {
  const isNykaa = url.includes("nykaa");
  const isAmazon = url.includes("amazon");
  const isFlipkart = url.includes("flipkart");
  const isMyntra = url.includes("myntra");
  const isBlinkit = url.includes("blinkit");

  const sourcePlatform: PlatformKey = isNykaa
    ? "nykaa"
    : isAmazon
      ? "amazon"
      : isFlipkart
        ? "flipkart"
        : isMyntra
          ? "myntra"
          : isBlinkit
            ? "blinkit"
            : "nykaa";

  // ---- Smart URL Parser ----
  let rawSlug = "";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname
      .replace(/^\//, "")
      .replace(/\/p\/.*$/, "")
      .replace(/\/dp\/.*$/, "")
      .replace(/\/itm.*$/, "")
      .split("/")
      .filter(Boolean);
    rawSlug = path.reduce((a, b) => (a.length >= b.length ? a : b), "");
  } catch {
    rawSlug = url;
  }

  const cleanName = rawSlug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();

  // Detect brand
  const KNOWN_BRANDS: Record<string, string> = {
    mac: "MAC", maybelline: "Maybelline", lakme: "Lakmé", nars: "NARS",
    "ray-ban": "Ray-Ban", rayban: "Ray-Ban", nike: "Nike", adidas: "Adidas",
    lego: "LEGO", barbie: "Barbie", mcaffeine: "mCaffeine", loreal: "L'Oréal",
    nivea: "Nivea", dove: "Dove", mamaearth: "Mamaearth", biotique: "Biotique",
    plum: "Plum", sugar: "SUGAR", colorbar: "Colorbar", faces: "FACES",
    nykaa: "Nykaa", boat: "boAt", samsung: "Samsung", apple: "Apple",
    sony: "Sony", philips: "Philips", himalaya: "Himalaya", cetaphil: "Cetaphil",
    neutrogena: "Neutrogena", olay: "Olay", ponds: "Pond's", garnier: "Garnier",
    "the body shop": "The Body Shop", forest: "Forest Essentials",
    kama: "Kama Ayurveda", wow: "WOW", beardo: "Beardo",
  };

  let detectedBrand = "";
  const nameLower = cleanName.toLowerCase();
  for (const [key, brand] of Object.entries(KNOWN_BRANDS)) {
    if (nameLower.includes(key)) {
      detectedBrand = brand;
      break;
    }
  }
  if (!detectedBrand) {
    detectedBrand = cleanName.split(" ")[0] || "Brand";
  }

  // Detect category
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "Body Care": ["body wash", "body lotion", "shower", "bath", "de-tan", "scrub", "body cream"],
    "Skincare": ["face wash", "moisturizer", "serum", "sunscreen", "cleanser", "toner", "cream", "mask", "peel"],
    "Lips": ["lipstick", "lip", "gloss", "lip balm", "lip liner"],
    "Hair Care": ["shampoo", "conditioner", "hair", "oil", "hair color", "hair mask"],
    "Fragrance": ["perfume", "fragrance", "deodorant", "deo", "cologne", "body mist"],
    "Sunglasses": ["sunglasses", "eyewear", "glasses", "aviator", "wayfarer"],
    "Foundation": ["foundation", "base", "concealer", "bb cream", "cc cream"],
    "Nails": ["nail", "nail polish", "nail color", "nail paint"],
    "Blush": ["blush", "cheek", "highlighter"],
    "Electronics": ["phone", "earbuds", "headphone", "charger", "cable", "watch", "speaker"],
    "Clothing": ["shirt", "tshirt", "dress", "jeans", "kurta", "saree", "jacket"],
    "Toys": ["toy", "lego", "barbie", "doll", "puzzle", "game"],
  };

  let detectedCategory = "Beauty & Personal Care";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => nameLower.includes(kw))) {
      detectedCategory = cat;
      break;
    }
  }

  // Fallback images by category
  const CATEGORY_IMAGES: Record<string, string> = {
    "Body Care": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=70",
    "Skincare": "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400&q=70",
    "Lips": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=70",
    "Hair Care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=70",
    "Fragrance": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=70",
    "Sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=70",
    "Foundation": "https://images.unsplash.com/photo-1631214524020-7b6d6cb84d23?w=400&q=70",
    "Nails": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=70",
    "Blush": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=70",
    "Electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70",
    "Clothing": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=70",
    "Toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=70",
    "Beauty & Personal Care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70",
  };

  const image = CATEGORY_IMAGES[detectedCategory] || CATEGORY_IMAGES["Beauty & Personal Care"];

  // Realistic category-based pricing
  const CATEGORY_PRICE_RANGES: Record<string, [number, number]> = {
    "Body Care": [199, 799],
    "Skincare": [249, 1499],
    "Lips": [299, 1999],
    "Hair Care": [199, 999],
    "Fragrance": [499, 4999],
    "Sunglasses": [1999, 14999],
    "Foundation": [299, 1799],
    "Nails": [99, 499],
    "Blush": [399, 2999],
    "Electronics": [499, 29999],
    "Clothing": [399, 4999],
    "Toys": [299, 2999],
    "Beauty & Personal Care": [199, 1999],
  };

  // Deterministic hash for consistent results per URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }

  const range = CATEGORY_PRICE_RANGES[detectedCategory] || [199, 1999];
  const basePrice = range[0] + Math.abs(hash % (range[1] - range[0]));

  const productName = cleanName || "Unknown Product";
  const searchQuery = encodeURIComponent(productName);

  // Generate realistic price variations across platforms
  // Prices vary by small realistic amounts (±2-8%), not wild random offsets
  const variation = (seed: number) => {
    const pct = ((Math.abs(hash * seed) % 12) - 4) / 100; // -4% to +8%
    return Math.round(basePrice * pct);
  };

  const generatePlatform = (
    key: PlatformKey,
    priceOffset: number,
    deliveryFee: number,
    inStock: boolean,
    rating: number,
    reviews: number,
    deliveryTime: string
  ) => {
    const price = Math.max(Math.round(basePrice + priceOffset), 49);
    const gst = Math.round(price * 0.18);
    return {
      platform: key,
      price,
      deliveryFee,
      gst,
      total: price + deliveryFee + gst,
      inStock,
      rating,
      reviews,
      url: `https://www.${key === "blinkit" ? "blinkit" : key}.com/search?q=${searchQuery}`,
      delivery: deliveryTime,
    };
  };

  return {
    productName,
    brand: detectedBrand,
    image,
    category: detectedCategory,
    sourcePlatform,
    fromAPI: false,
    results: [
      generatePlatform("nykaa", 0, 0, true, 4.3, 2841, "2-4 days"),
      generatePlatform("amazon", variation(7), 40, true, 4.5, 12430, "1-2 days"),
      generatePlatform("flipkart", variation(13), 0, Math.abs(hash % 3) !== 0, 4.1, 8920, "2-3 days"),
      generatePlatform("myntra", variation(19), 0, true, 4.2, 3510, "3-5 days"),
      generatePlatform("blinkit", variation(23) + Math.round(basePrice * 0.05), 25, Math.abs(hash % 4) !== 0, 3.9, 420, "10 mins"),
    ].sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return a.total - b.total;
    }),
  };
}

/* ---------- ANIMATED SEARCHING STEPS ---------- */
const SEARCH_STEPS = [
  "Extracting product details from URL...",
  "Searching across Nykaa...",
  "Checking Amazon prices...",
  "Scanning Flipkart listings...",
  "Comparing on Myntra...",
  "Checking Blinkit availability...",
  "Calculating best deal...",
];

/* ---------- MAIN COMPONENT ---------- */

function TrackPage() {
  const [url, setUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [result, setResult] = useState<TrackedResult | null>(null);
  const [alertSet, setAlertSet] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!url.trim()) return;
    setIsSearching(true);
    setSearchStep(0);
    setResult(null);
    setAlertSet(false);
    setApiError(null);
  };

  // Step animation timer
  useEffect(() => {
    if (!isSearching || searchStep >= SEARCH_STEPS.length) return;
    const t = setTimeout(() => setSearchStep((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [isSearching, searchStep]);

  // Fetch from server function once all steps complete, fallback to simulateSearch
  useEffect(() => {
    if (!isSearching || searchStep < SEARCH_STEPS.length) return;
    let cancelled = false;
    const fetchResult = async () => {
      try {
        const data = await trackProduct({ data: { url } });
        if (cancelled) return;
        setResult(data as TrackedResult);
      } catch (err: any) {
        if (cancelled) return;
        setApiError("Live data unavailable — showing estimated prices.");
        setResult(simulateSearch(url));
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    fetchResult();
    return () => { cancelled = true; };
  }, [isSearching, searchStep, url]);

  const best = result?.results.find((r) => r.inStock);
  const worst = result?.results.filter((r) => r.inStock).slice(-1)[0];
  const savings = best && worst ? worst.total - best.total : 0;

  return (
    <div
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
        <Navbar />

        <div className="px-4 sm:px-8 pt-6 pb-16 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#ef4d23]/10 text-[#ef4d23] rounded-full px-4 py-1.5 text-[13px] font-medium mb-4">
              <Sparkles size={14} /> Smart Price Tracker
            </div>
            <h1
              className="text-neutral-900 mb-3"
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Paste any product link.
              <br />
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                We find the best price.
              </span>
            </h1>
            <p className="text-neutral-500 text-[14px] max-w-lg mx-auto">
              Drop a link from Nykaa, Amazon, Flipkart, or Myntra — we'll scan
              all major platforms and show you where to buy at the lowest total
              cost.
            </p>
          </div>

          {/* URL Input */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 bg-neutral-50 border-2 border-neutral-200 rounded-2xl px-4 py-3 focus-within:border-[#ef4d23] transition-colors">
              <Link2
                size={20}
                className="text-neutral-400 shrink-0"
              />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="https://www.nykaa.com/mac-retro-matte-lipstick/p/362228"
                className="flex-1 bg-transparent outline-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
                disabled={isSearching}
              />
              {url && !isSearching && (
                <button onClick={() => setUrl("")} className="text-neutral-400 hover:text-neutral-600">
                  <X size={16} />
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={!url.trim() || isSearching}
                className="inline-flex items-center gap-2 bg-[#0b0f1a] disabled:bg-neutral-300 text-white rounded-xl px-5 py-2.5 text-[13px] font-medium transition-colors shrink-0"
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Track Price
              </button>
            </div>

            {/* Platform badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-[11px] text-neutral-400">
                Supported:
              </span>
              {(
                ["nykaa", "amazon", "flipkart", "myntra", "blinkit"] as PlatformKey[]
              ).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 bg-neutral-100 rounded-full px-2.5 py-0.5 text-[11px] text-neutral-600"
                >
                  <span style={{ color: platforms[key].color }}>
                    {platforms[key].logo}
                  </span>
                  {platforms[key].label}
                </span>
              ))}
            </div>
          </div>

          {/* API ERROR BANNER */}
          {apiError && (
            <div className="max-w-2xl mx-auto mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-[13px] text-amber-700">
              <Zap size={14} className="shrink-0" />
              {apiError}
            </div>
          )}

          {/* SEARCHING STATE */}
          {isSearching && (
            <div className="max-w-lg mx-auto bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
              <div className="flex flex-col gap-2.5">
                {SEARCH_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 text-[13px] transition-all duration-300 ${i < searchStep ? "text-emerald-600" : i === searchStep ? "text-neutral-900" : "text-neutral-300"}`}
                  >
                    {i < searchStep ? (
                      <Check size={16} className="text-emerald-500 shrink-0" />
                    ) : i === searchStep ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-[#ef4d23] shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                    )}
                    {step}
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ef4d23] to-[#ff8a5c] rounded-full transition-all duration-500"
                  style={{
                    width: `${(searchStep / SEARCH_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* RESULTS */}
          {result && !isSearching && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-5 bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                <img
                  src={result.image}
                  alt={result.productName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 bg-neutral-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70";
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500">
                    {result.brand}
                  </span>
                  <h2 className="text-[20px] font-medium text-neutral-900 mt-0.5 mb-2">
                    {result.productName}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-neutral-200 text-neutral-700 rounded-full px-2.5 py-0.5 text-[11px]">
                      {result.category}
                    </span>
                    <span className="bg-neutral-200 text-neutral-700 rounded-full px-2.5 py-0.5 text-[11px]">
                      Source: {platforms[result.sourcePlatform].label}
                    </span>
                    {result.fromAPI && (
                      <span className="bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-0.5 text-[11px] inline-flex items-center gap-1">
                        <Zap size={10} /> Live prices
                      </span>
                    )}
                  </div>
                  {best && savings > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-[12px] font-medium">
                      <TrendingDown size={14} /> Save {formatPrice(savings)} by
                      buying on {platforms[best.platform].label}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Comparison Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-medium text-neutral-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Price Comparison ({result.results.length} platforms)
                  </h3>
                  <span className="text-[10px] text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                    {result.fromAPI ? "Live prices · may vary" : "Estimated prices · may vary"}
                  </span>
                </div>
                {result.results.map((entry, i) => {
                  const meta = platforms[entry.platform];
                  const isBest = i === 0 && entry.inStock;
                  return (
                    <div
                      key={entry.platform}
                      className={`relative rounded-xl border p-4 transition-all ${isBest ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : entry.inStock ? "border-neutral-200 bg-white" : "border-neutral-200 bg-neutral-50 opacity-60"}`}
                    >
                      {isBest && (
                        <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          ✓ Best Deal
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 sm:w-48">
                          <span
                            className="text-xl"
                            style={{ color: meta.color }}
                          >
                            {meta.logo}
                          </span>
                          <div>
                            <div className="font-medium text-[14px] text-neutral-900">
                              {meta.label}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                              <Star
                                size={10}
                                className="text-amber-500 fill-amber-500"
                              />
                              {entry.rating} ({entry.reviews.toLocaleString()})
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-4 gap-2 text-[12px]">
                          <div>
                            <span className="text-neutral-500">Base</span>
                            <div className="font-medium text-neutral-900">
                              {formatPrice(entry.price)}
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-500">Delivery</span>
                            <div className="font-medium text-neutral-900">
                              {entry.deliveryFee === 0
                                ? "Free"
                                : formatPrice(entry.deliveryFee)}
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-500">GST</span>
                            <div className="font-medium text-neutral-900">
                              {formatPrice(entry.gst)}
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-500">Total</span>
                            <div
                              className={`font-semibold text-[14px] ${isBest ? "text-emerald-700" : "text-neutral-900"}`}
                            >
                              {formatPrice(entry.total)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:w-52 justify-end">
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                            <Clock size={10} /> {entry.delivery}
                          </span>
                          {entry.inStock ? (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium transition-colors ${isBest ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-[#0b0f1a] hover:bg-neutral-800 text-white"}`}
                            >
                              Buy <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-[11px] text-neutral-400 bg-neutral-100 rounded-full px-3 py-1.5">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Drop Alert */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell size={18} className="text-[#ef4d23]" />
                      <h3 className="font-medium text-[15px]">
                        Set a Price Drop Alert
                      </h3>
                    </div>
                    <p className="text-neutral-400 text-[13px]">
                      We'll notify you when this product's price drops below{" "}
                      {best ? formatPrice(best.total) : "the current best"} on
                      any platform.
                    </p>
                  </div>
                  <button
                    onClick={() => setAlertSet(true)}
                    disabled={alertSet}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-medium transition-all shrink-0 ${alertSet ? "bg-emerald-500 text-white" : "bg-[#ef4d23] hover:bg-[#d8401b] text-white"}`}
                  >
                    {alertSet ? (
                      <>
                        <Check size={16} /> Alert Set!
                      </>
                    ) : (
                      <>
                        <Bell size={16} /> Notify Me
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RECENT SEARCHES (shown when no result) */}
          {!result && !isSearching && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-[13px] font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Recent Searches
              </h3>
              <div className="space-y-2">
                {RECENT_SEARCHES.map((item) => (
                  <button
                    key={item.url}
                    onClick={() => {
                      setUrl(item.url);
                      setIsSearching(true);
                      setSearchStep(0);
                      setResult(null);
                      setAlertSet(false);
                      setApiError(null);
                    }}
                    className="w-full flex items-center gap-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-left transition-colors group"
                  >
                    <Package size={18} className="text-neutral-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-neutral-900 truncate">
                        {item.product}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {item.url}
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0">
                      {item.time}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-neutral-300 group-hover:text-[#ef4d23] transition-colors shrink-0"
                    />
                  </button>
                ))}
              </div>

              {/* How it works */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Link2,
                    title: "Paste a Link",
                    desc: "Copy any product URL from Nykaa, Amazon, Flipkart, or Myntra.",
                  },
                  {
                    icon: Search,
                    title: "We Compare",
                    desc: "We search all major platforms for the same product and calculate total cost.",
                  },
                  {
                    icon: TrendingDown,
                    title: "You Save",
                    desc: "Buy from the cheapest platform with full price transparency.",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ef4d23]/10 flex items-center justify-center mx-auto mb-3">
                      <step.icon size={20} className="text-[#ef4d23]" />
                    </div>
                    <h4 className="text-[14px] font-medium text-neutral-900 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-[12px] text-neutral-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
