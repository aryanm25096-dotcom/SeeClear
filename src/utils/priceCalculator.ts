import type { Product, PlatformEntry } from "@/data/products";

export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export interface BreakdownLine {
  label: string;
  value: number;
  isTotal?: boolean;
  isSaving?: boolean;
}

export function getPriceBreakdown(entry: PlatformEntry): BreakdownLine[] {
  return [
    { label: "Base price", value: entry.price },
    { label: "Delivery", value: entry.deliveryFee },
    { label: "GST", value: entry.gst },
    { label: "Total", value: entry.total, isTotal: true },
  ];
}

export function getCheapestPlatform(product: Product): PlatformEntry {
  const inStock = product.platforms.filter((p) => p.inStock);
  const list = inStock.length ? inStock : product.platforms;
  return list.reduce((a, b) => (a.total < b.total ? a : b));
}

export function getMostExpensivePlatform(product: Product): PlatformEntry {
  const inStock = product.platforms.filter((p) => p.inStock);
  const list = inStock.length ? inStock : product.platforms;
  return list.reduce((a, b) => (a.total > b.total ? a : b));
}

export function getSavings(product: Product): string {
  const cheap = getCheapestPlatform(product);
  const exp = getMostExpensivePlatform(product);
  if (cheap.platform === exp.platform) return "";
  const diff = exp.total - cheap.total;
  return `Save ${formatPrice(diff)} vs ${exp.platform}`;
}

export function getPriceVariance(product: Product): {
  min: number;
  max: number;
  difference: number;
  percentDifference: number;
} {
  const totals = product.platforms.filter((p) => p.inStock).map((p) => p.total);
  const list = totals.length ? totals : product.platforms.map((p) => p.total);
  const min = Math.min(...list);
  const max = Math.max(...list);
  const difference = max - min;
  const percentDifference = min ? Math.round((difference / min) * 100) : 0;
  return { min, max, difference, percentDifference };
}
