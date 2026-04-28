import type { Product } from "@/data/products";
import { platforms } from "@/data/platforms";
import {
  formatPrice,
  getCheapestPlatform,
  getMostExpensivePlatform,
  getPriceVariance,
} from "@/utils/priceCalculator";

export default function PriceComparisonTable({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const cheapest = getCheapestPlatform(product);
  const expensive = getMostExpensivePlatform(product);
  const variance = getPriceVariance(product);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-600 text-[12px]">
            <tr>
              <th className="px-3 py-2.5 font-medium">Platform</th>
              {!compact && <th className="px-3 py-2.5 font-medium">Base</th>}
              {!compact && <th className="px-3 py-2.5 font-medium">Delivery</th>}
              {!compact && <th className="px-3 py-2.5 font-medium">GST</th>}
              <th className="px-3 py-2.5 font-medium">Total</th>
              <th className="px-3 py-2.5 font-medium text-right">Buy</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-neutral-900">
            {product.platforms.map((entry) => {
              const meta = platforms[entry.platform];
              const isBest = entry.platform === cheapest.platform && entry.inStock;
              return (
                <tr
                  key={entry.platform}
                  className={
                    "border-t border-neutral-100 " +
                    (isBest ? "bg-emerald-50/60 " : "") +
                    (!entry.inStock ? "opacity-50 " : "")
                  }
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden style={{ color: meta.color }}>
                        {meta.logo}
                      </span>
                      <span className="font-medium">{meta.label}</span>
                      {isBest && (
                        <span className="ml-1 text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                          Best
                        </span>
                      )}
                    </span>
                  </td>
                  {!compact && <td className="px-3 py-2.5">{formatPrice(entry.price)}</td>}
                  {!compact && (
                    <td className="px-3 py-2.5 text-neutral-600">
                      {entry.deliveryFee === 0 ? "Free" : formatPrice(entry.deliveryFee)}
                    </td>
                  )}
                  {!compact && (
                    <td className="px-3 py-2.5 text-neutral-600">{formatPrice(entry.gst)}</td>
                  )}
                  <td className="px-3 py-2.5 font-semibold">{formatPrice(entry.total)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {entry.inStock ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#0b0f1a] text-white rounded-full px-3 py-1 text-[12px]"
                      >
                        Buy
                      </a>
                    ) : (
                      <span className="text-[11px] text-neutral-500">Out of stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cheapest.platform !== expensive.platform && (
        <div className="mt-3 flex flex-wrap gap-3 text-[12px]">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
            ✓ Save {formatPrice(expensive.total - cheapest.total)} vs{" "}
            {platforms[expensive.platform].label}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 rounded-full px-3 py-1">
            Prices vary by {variance.percentDifference}% across platforms
          </span>
        </div>
      )}
    </div>
  );
}
