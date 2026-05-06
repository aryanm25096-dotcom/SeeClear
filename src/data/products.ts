import type { PlatformKey } from "./platforms";

export type Category =
  | "lips"
  | "nails"
  | "sunglasses"
  | "jewellery"
  | "clothing"
  | "foundation"
  | "blush"
  | "haircolor"
  | "toys";

export type ARType =
  | "lips"
  | "nails"
  | "sunglasses"
  | "wrist"
  | "finger"
  | "body"
  | "skin"
  | "hair"
  | "size-reference";

export interface PlatformEntry {
  platform: PlatformKey;
  price: number;
  deliveryFee: number;
  gst: number;
  total: number;
  inStock: boolean;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  arType: ARType;
  shade: string | null;
  overlayImage: string | null;
  thumbnail: string;
  dimensions: { cm: string; inches: string } | null;
  platforms: PlatformEntry[];
  bestPrice: { platform: PlatformKey; total: number };
}

// helper to compute totals + bestPrice
function buildPlatforms(
  entries: Array<{
    platform: PlatformKey;
    price: number;
    deliveryFee: number;
    gstRate?: number;
    inStock?: boolean;
    url: string;
  }>,
): { platforms: PlatformEntry[]; bestPrice: { platform: PlatformKey; total: number } } {
  const platforms = entries.map((e) => {
    const gst = Math.round(e.price * (e.gstRate ?? 0.12));
    const total = e.price + e.deliveryFee + gst;
    return {
      platform: e.platform,
      price: e.price,
      deliveryFee: e.deliveryFee,
      gst,
      total,
      inStock: e.inStock ?? true,
      url: e.url,
    };
  });
  const inStock = platforms.filter((p) => p.inStock);
  const cheapest = (inStock.length ? inStock : platforms).reduce((a, b) =>
    a.total < b.total ? a : b,
  );
  return { platforms, bestPrice: { platform: cheapest.platform, total: cheapest.total } };
}

const IMG = {
  lipstick:
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=70",
  lipstickAlt:
    "https://images.unsplash.com/photo-1599733589046-8a35aacc3a64?w=800&q=70",
  lipstickMatte:
    "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=800&q=70",
  lipstickGloss:
    "https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=800&q=70",
  lipstickLiquid:
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=70",
};

function lipstickProduct(
  id: string,
  brand: string,
  shadeName: string,
  shade: string,
  basePrice: number,
  thumb?: string,
): Product {
  const built = buildPlatforms([
    {
      platform: "nykaa",
      price: basePrice,
      deliveryFee: 0,
      url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(brand + " " + shadeName)}`,
    },
    {
      platform: "amazon",
      price: basePrice - 50,
      deliveryFee: 40,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(brand + " " + shadeName)}`,
    },
    {
      platform: "flipkart",
      price: basePrice - 20,
      deliveryFee: 0,
      inStock: false,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(brand + " " + shadeName)}`,
    },
    {
      platform: "myntra",
      price: basePrice + 30,
      deliveryFee: 0,
      url: `https://www.myntra.com/${encodeURIComponent(brand)}`,
    },
  ]);
  return {
    id,
    name: `${brand} Matte Lipstick — ${shadeName}`,
    brand,
    category: "lips",
    arType: "lips",
    shade,
    overlayImage: null,
    thumbnail: thumb ?? IMG.lipstick,
    dimensions: null,
    ...built,
  };
}

export const products: Product[] = [
  // ─── Lakme 9to5 range ───────────────────────────────────────────────────
  lipstickProduct("lip-lakme-red",      "Lakme 9to5", "Classic Red",     "#C41E3A", 599),
  lipstickProduct("lip-lakme-pink",     "Lakme 9to5", "Hot Pink",        "#FF69B4", 599),
  lipstickProduct("lip-lakme-darkred",  "Lakme 9to5", "Dark Cherry",     "#8B0000", 599),
  lipstickProduct("lip-lakme-nude",     "Lakme 9to5", "Soft Nude",       "#E8A598", 599),
  lipstickProduct("lip-lakme-coral",    "Lakme 9to5", "Coral Pop",       "#FF4500", 599),
  lipstickProduct("lip-lakme-plum",     "Lakme 9to5", "Plum Paradise",   "#8E4585", 599),
  lipstickProduct("lip-lakme-berry",    "Lakme 9to5", "Berry Bliss",     "#8E354A", 599),
  lipstickProduct("lip-lakme-mauve",    "Lakme 9to5", "Mauve Affair",    "#C08081", 649),

  // ─── MAC range ──────────────────────────────────────────────────────────
  lipstickProduct("lip-mac-retro",      "MAC", "Retro Red",              "#C41E3A", 1850, IMG.lipstickAlt),
  lipstickProduct("lip-mac-rubywoo",    "MAC", "Ruby Woo",               "#CC0033", 1850, IMG.lipstickAlt),
  lipstickProduct("lip-mac-velvet",     "MAC", "Velvet Teddy",           "#B5654A", 1850, IMG.lipstickMatte),
  lipstickProduct("lip-mac-diva",       "MAC", "Diva",                   "#7B0051", 1850, IMG.lipstickMatte),
  lipstickProduct("lip-mac-taupe",      "MAC", "Taupe",                  "#B27D6A", 1850, IMG.lipstickMatte),

  // ─── Maybelline range ───────────────────────────────────────────────────
  lipstickProduct("lip-mayb-seductress","Maybelline", "Seductress",      "#D32F2F", 449, IMG.lipstickLiquid),
  lipstickProduct("lip-mayb-lover",     "Maybelline", "Lover",           "#E57373", 449, IMG.lipstickLiquid),
  lipstickProduct("lip-mayb-ruler",     "Maybelline", "Ruler",           "#B71C1C", 449, IMG.lipstickLiquid),
  lipstickProduct("lip-mayb-dreamer",   "Maybelline", "Dreamer",         "#F48FB1", 449, IMG.lipstickLiquid),
  lipstickProduct("lip-mayb-pioneer",   "Maybelline", "Pioneer",         "#AD1457", 399, IMG.lipstickLiquid),

  // ─── SUGAR Cosmetics range ──────────────────────────────────────────────
  lipstickProduct("lip-sugar-scarlet",  "SUGAR", "Scarlet O'Hara",       "#FF2400", 699, IMG.lipstickGloss),
  lipstickProduct("lip-sugar-rose",     "SUGAR", "Rosé All Day",         "#D4707E", 699, IMG.lipstickGloss),
  lipstickProduct("lip-sugar-wine",     "SUGAR", "Wine & Dine",          "#722F37", 699, IMG.lipstickGloss),
  lipstickProduct("lip-sugar-peach",    "SUGAR", "Peach Pout",           "#FFCBA4", 649, IMG.lipstickGloss),

  // ─── Colorbar range ────────────────────────────────────────────────────
  lipstickProduct("lip-cb-passion",     "Colorbar", "Passion",           "#E63946", 525),
  lipstickProduct("lip-cb-ballet",      "Colorbar", "Ballet Pink",       "#F4A6B0", 525),
  lipstickProduct("lip-cb-mulberry",    "Colorbar", "Mulberry",          "#770737", 525),

  // ─── Nykaa So Matte range ──────────────────────────────────────────────
  lipstickProduct("lip-nykaa-devious",  "Nykaa", "Devious Pink",         "#DE5285", 399),
  lipstickProduct("lip-nykaa-hotshot",  "Nykaa", "Hotshot Red",          "#FF1D15", 399),
  lipstickProduct("lip-nykaa-cinnamon", "Nykaa", "Cinnamon",             "#D2691E", 399),
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
