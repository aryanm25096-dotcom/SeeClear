import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { platforms } from "@/data/platforms";
import { formatPrice, getCheapestPlatform, getPriceVariance } from "@/utils/priceCalculator";

export default function ProductCard({ product }: { product: Product }) {
  const cheapest = getCheapestPlatform(product);
  const variance = getPriceVariance(product);
  const platformMeta = platforms[cheapest.platform];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square bg-neutral-100 overflow-hidden"
      >
        <img
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.shade && (
          <span
            aria-hidden
            className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: product.shade }}
          />
        )}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 text-[11px] capitalize text-neutral-800">
          {product.category}
        </span>
      </Link>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="text-[11px] text-neutral-500 uppercase tracking-wide">{product.brand}</div>
        <div className="text-[13px] text-neutral-900 font-medium leading-snug line-clamp-2 min-h-[34px]">
          {product.name}
        </div>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[16px] font-semibold text-neutral-900">
            {formatPrice(cheapest.total)}
          </span>
          <span className="text-[11px] text-neutral-500">on {platformMeta.label}</span>
        </div>
        <div className="text-[11px] text-neutral-500">
          {formatPrice(variance.min)} — {formatPrice(variance.max)} across {product.platforms.length} platforms
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="text-center bg-[#0b0f1a] text-white rounded-full py-1.5 text-[12px]"
          >
            Compare
          </Link>
          <button
            type="button"
            disabled
            title="AR Try-On coming soon"
            className="text-center bg-[#ef4d23]/10 text-[#ef4d23] rounded-full py-1.5 text-[12px] cursor-not-allowed"
          >
            Try-On 📷
          </button>
        </div>
      </div>
    </div>
  );
}
