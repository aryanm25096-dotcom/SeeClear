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
  nail: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=70",
  nailAlt:
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=70",
  sunglasses:
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=70",
  aviator:
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=70",
  round:
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=70",
  cateye:
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=70",
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=70",
  bracelet:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=70",
  necklace:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=70",
  bangle:
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=70",
  foundation:
    "https://images.unsplash.com/photo-1631214524020-7b6d6cb84d23?w=800&q=70",
  blush:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=70",
  haircolor:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=70",
  lego: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=70",
  hotwheels:
    "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=70",
  rubiks:
    "https://images.unsplash.com/photo-1577374903841-3796db508a1e?w=800&q=70",
  barbie:
    "https://images.unsplash.com/photo-1558877385-8c1b8d2d3a98?w=800&q=70",
  playdoh:
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=70",
};

function lipstickProduct(
  id: string,
  brand: string,
  shadeName: string,
  shade: string,
  basePrice: number,
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
    thumbnail: IMG.lipstick,
    dimensions: null,
    ...built,
  };
}

function nailProduct(id: string, shadeName: string, shade: string): Product {
  const base = 249;
  const built = buildPlatforms([
    {
      platform: "nykaa",
      price: base,
      deliveryFee: 0,
      url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent("Lakme nail " + shadeName)}`,
    },
    {
      platform: "amazon",
      price: base - 30,
      deliveryFee: 40,
      url: `https://www.amazon.in/s?k=${encodeURIComponent("Lakme nail " + shadeName)}`,
    },
    {
      platform: "blinkit",
      price: base + 10,
      deliveryFee: 20,
      url: `https://blinkit.com/s/?q=${encodeURIComponent("Lakme nail " + shadeName)}`,
    },
  ]);
  return {
    id,
    name: `Lakme True Wear Nail — ${shadeName}`,
    brand: "Lakme",
    category: "nails",
    arType: "nails",
    shade,
    overlayImage: null,
    thumbnail: IMG.nail,
    dimensions: null,
    ...built,
  };
}

function sunglassProduct(
  id: string,
  brand: string,
  style: string,
  basePrice: number,
  thumb: string,
): Product {
  const built = buildPlatforms([
    {
      platform: "amazon",
      price: basePrice,
      deliveryFee: 0,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(brand + " " + style)}`,
    },
    {
      platform: "flipkart",
      price: basePrice + 200,
      deliveryFee: 0,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(brand + " " + style)}`,
    },
    {
      platform: "myntra",
      price: basePrice - 100,
      deliveryFee: 99,
      url: `https://www.myntra.com/${encodeURIComponent(brand)}`,
    },
  ]);
  return {
    id,
    name: `${brand} ${style}`,
    brand,
    category: "sunglasses",
    arType: "sunglasses",
    shade: null,
    overlayImage: thumb,
    thumbnail: thumb,
    dimensions: null,
    ...built,
  };
}

function jewelleryProduct(
  id: string,
  name: string,
  arType: ARType,
  basePrice: number,
  thumb: string,
): Product {
  const built = buildPlatforms([
    {
      platform: "amazon",
      price: basePrice,
      deliveryFee: 0,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
    },
    {
      platform: "flipkart",
      price: basePrice + 150,
      deliveryFee: 0,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
    },
    {
      platform: "myntra",
      price: basePrice - 80,
      deliveryFee: 0,
      inStock: false,
      url: `https://www.myntra.com/search?q=${encodeURIComponent(name)}`,
    },
    {
      platform: "nykaa",
      price: basePrice + 50,
      deliveryFee: 0,
      url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(name)}`,
    },
  ]);
  return {
    id,
    name,
    brand: "SeeClear Picks",
    category: "jewellery",
    arType,
    shade: null,
    overlayImage: thumb,
    thumbnail: thumb,
    dimensions: null,
    ...built,
  };
}

function foundationProduct(id: string, shadeName: string, shade: string): Product {
  const base = 549;
  const built = buildPlatforms([
    {
      platform: "nykaa",
      price: base,
      deliveryFee: 0,
      url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent("Maybelline Fit Me " + shadeName)}`,
    },
    {
      platform: "amazon",
      price: base - 60,
      deliveryFee: 40,
      url: `https://www.amazon.in/s?k=${encodeURIComponent("Maybelline Fit Me " + shadeName)}`,
    },
    {
      platform: "flipkart",
      price: base - 20,
      deliveryFee: 0,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent("Maybelline Fit Me " + shadeName)}`,
    },
  ]);
  return {
    id,
    name: `Maybelline Fit Me Foundation — ${shadeName}`,
    brand: "Maybelline",
    category: "foundation",
    arType: "skin",
    shade,
    overlayImage: null,
    thumbnail: IMG.foundation,
    dimensions: null,
    ...built,
  };
}

function hairColorProduct(id: string, shadeName: string, shade: string): Product {
  const base = 199;
  const built = buildPlatforms([
    {
      platform: "amazon",
      price: base,
      deliveryFee: 40,
      url: `https://www.amazon.in/s?k=${encodeURIComponent("Streax " + shadeName)}`,
    },
    {
      platform: "flipkart",
      price: base + 20,
      deliveryFee: 0,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent("Streax " + shadeName)}`,
    },
    {
      platform: "nykaa",
      price: base + 50,
      deliveryFee: 0,
      url: `https://www.nykaa.com/search/result/?q=${encodeURIComponent("Streax " + shadeName)}`,
    },
  ]);
  return {
    id,
    name: `Streax Hair Color — ${shadeName}`,
    brand: "Streax",
    category: "haircolor",
    arType: "hair",
    shade,
    overlayImage: null,
    thumbnail: IMG.haircolor,
    dimensions: null,
    ...built,
  };
}

function toyProduct(
  id: string,
  name: string,
  basePrice: number,
  cm: string,
  inches: string,
  thumb: string,
): Product {
  const built = buildPlatforms([
    {
      platform: "amazon",
      price: basePrice,
      deliveryFee: 0,
      url: `https://www.amazon.in/s?k=${encodeURIComponent(name)}`,
    },
    {
      platform: "flipkart",
      price: basePrice + 100,
      deliveryFee: 0,
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
    },
    {
      platform: "firstcry",
      price: basePrice - 50,
      deliveryFee: 50,
      url: `https://www.firstcry.com/search?q=${encodeURIComponent(name)}`,
    },
  ]);
  return {
    id,
    name,
    brand: name.split(" ")[0],
    category: "toys",
    arType: "size-reference",
    shade: null,
    overlayImage: thumb,
    thumbnail: thumb,
    dimensions: { cm, inches },
    ...built,
  };
}

export const products: Product[] = [
  // LIPS — 5 Lakme shades + 1 MAC
  lipstickProduct("lip-lakme-red", "Lakme 9to5", "Classic Red", "#C41E3A", 599),
  lipstickProduct("lip-lakme-pink", "Lakme 9to5", "Hot Pink", "#FF69B4", 599),
  lipstickProduct("lip-lakme-darkred", "Lakme 9to5", "Dark Cherry", "#8B0000", 599),
  lipstickProduct("lip-lakme-nude", "Lakme 9to5", "Soft Nude", "#E8A598", 599),
  lipstickProduct("lip-lakme-coral", "Lakme 9to5", "Coral Pop", "#FF4500", 599),
  lipstickProduct("lip-mac-retro", "MAC", "Retro Red", "#C41E3A", 1850),

  // NAILS
  nailProduct("nail-red", "Fiery Red", "#FF0000"),
  nailProduct("nail-pink", "Pink Burst", "#FF69B4"),
  nailProduct("nail-purple", "Royal Purple", "#800080"),
  nailProduct("nail-black", "Jet Black", "#000000"),

  // SUNGLASSES
  sunglassProduct("sg-rb-wayfarer", "Ray-Ban", "Wayfarer", 6990, IMG.sunglasses),
  sunglassProduct("sg-rb-aviator", "Ray-Ban", "Aviator", 7490, IMG.aviator),
  sunglassProduct("sg-ft-round", "Fastrack", "Round", 1295, IMG.round),
  sunglassProduct("sg-ft-cateye", "Fastrack", "Cat-eye", 1495, IMG.cateye),

  // JEWELLERY
  jewelleryProduct("jw-gold-ring", "Gold Ring", "finger", 4999, IMG.ring),
  jewelleryProduct("jw-silver-bracelet", "Silver Bracelet", "wrist", 1899, IMG.bracelet),
  jewelleryProduct("jw-pearl-necklace", "Pearl Necklace", "body", 2499, IMG.necklace),
  jewelleryProduct("jw-rosegold-bangle", "Rose Gold Bangle", "wrist", 3299, IMG.bangle),

  // FOUNDATION + BLUSH
  foundationProduct("fd-light", "Light 110", "#F5CBA7"),
  foundationProduct("fd-medium", "Medium 220", "#E5A87B"),
  foundationProduct("fd-dark", "Deep 330", "#C68642"),
  {
    id: "blush-nars-orgasm",
    name: "NARS Blush — Orgasm",
    brand: "NARS",
    category: "blush",
    arType: "skin",
    shade: "#FF6B81",
    overlayImage: null,
    thumbnail: IMG.blush,
    dimensions: null,
    ...buildPlatforms([
      { platform: "nykaa", price: 3300, deliveryFee: 0, url: "https://www.nykaa.com/search/result/?q=NARS+Orgasm" },
      { platform: "amazon", price: 3150, deliveryFee: 0, url: "https://www.amazon.in/s?k=NARS+Orgasm" },
      { platform: "flipkart", price: 3450, deliveryFee: 0, inStock: false, url: "https://www.flipkart.com/search?q=NARS+Orgasm" },
    ]),
  },

  // HAIR COLOR
  hairColorProduct("hair-brown", "Natural Brown", "#4A2810"),
  hairColorProduct("hair-burgundy", "Burgundy", "#800020"),
  hairColorProduct("hair-black", "Jet Black", "#000000"),

  // TOYS
  toyProduct("toy-lego", "LEGO Classic Set", 1999, "20 × 15 × 6", "7.9 × 5.9 × 2.4", IMG.lego),
  toyProduct("toy-hotwheels", "Hot Wheels Car", 149, "7 × 3 × 2", "2.8 × 1.2 × 0.8", IMG.hotwheels),
  toyProduct("toy-rubiks", "Rubik's Cube 3x3", 449, "5.7 × 5.7 × 5.7", "2.2 × 2.2 × 2.2", IMG.rubiks),
  toyProduct("toy-barbie", "Barbie Fashionista Doll", 999, "30 × 8 × 4", "11.8 × 3.1 × 1.6", IMG.barbie),
  toyProduct("toy-playdoh", "Play-Doh Starter Set", 599, "25 × 18 × 6", "9.8 × 7.1 × 2.4", IMG.playdoh),
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
