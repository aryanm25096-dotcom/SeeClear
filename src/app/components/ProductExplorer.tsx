import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/data/products";
import { products } from "@/data/products";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

function useDebounce<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// rudimentary "color word -> hex prefix" hint set
const COLOR_WORDS: Record<string, string[]> = {
  red: ["#C4", "#FF0", "#FF4", "#8B"],
  pink: ["#FF6", "#FF3"],
  black: ["#000"],
  brown: ["#4A"],
  nude: ["#E8"],
  purple: ["#80"],
  orange: ["#FF4"],
};

export default function ProductExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [loading, setLoading] = useState(true);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.brand} ${p.shade ?? ""}`.toLowerCase();
      if (haystack.includes(q)) return true;
      const colorPrefixes = COLOR_WORDS[q];
      if (colorPrefixes && p.shade) {
        return colorPrefixes.some((pref) => p.shade!.toUpperCase().startsWith(pref));
      }
      return false;
    });
  }, [debounced, category]);

  return (
    <section className="w-full bg-[#ededed] px-3 sm:px-4 pb-12 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2
            className="text-neutral-900"
            style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 500, letterSpacing: "-0.02em" }}
          >
            Try on. Compare. Save.
          </h2>
          <p className="mt-2 text-[14px] text-neutral-600">
            Browse {products.length} products across {7} platforms with full price transparency.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <SearchBar value={query} onChange={setQuery} />
          <FilterBar active={category} onChange={setCategory} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-[15px]">No products match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-3 text-[#ef4d23] underline text-[13px]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
