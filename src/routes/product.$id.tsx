import "../styles/fonts.css";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import PriceComparisonTable from "@/app/components/PriceComparisonTable";
import ReviewSummary from "@/app/components/ReviewSummary";
import { getProductById } from "@/data/products";
import { platforms } from "@/data/platforms";
import { formatPrice, getCheapestPlatform } from "@/utils/priceCalculator";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProductById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — SeeClear` },
          {
            name: "description",
            content: `Compare prices for ${loaderData.product.name} across Indian shopping platforms.`,
          },
        ]
      : [{ title: "Product — SeeClear" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#ededed]">
      <h1 className="text-2xl font-medium">Product not found</h1>
      <Link to="/" className="text-[#ef4d23] underline">
        Back to home
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#ededed]">
      <p className="text-neutral-700">{error.message}</p>
      <Link to="/" className="text-[#ef4d23] underline">
        Back to home
      </Link>
    </div>
  ),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const cheapest = getCheapestPlatform(product);
  const cheapMeta = platforms[cheapest.platform];

  return (
    <div
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
        <Navbar />

        <div className="px-4 sm:px-8 pt-4 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft size={14} /> Back to all products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.shade && (
                <span
                  aria-hidden
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: product.shade }}
                />
              )}
            </div>

            <div className="flex flex-col">
              <div className="text-[12px] uppercase tracking-wide text-neutral-500">
                {product.brand}
              </div>
              <h1
                className="mt-1 text-neutral-900"
                style={{
                  fontSize: "clamp(24px, 4vw, 36px)",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                <span className="bg-neutral-100 text-neutral-700 rounded-full px-2.5 py-0.5 capitalize">
                  {product.category}
                </span>
                <span className="bg-neutral-100 text-neutral-700 rounded-full px-2.5 py-0.5">
                  AR: {product.arType}
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-neutral-900">
                  {formatPrice(cheapest.total)}
                </span>
                <span className="text-[13px] text-neutral-500">
                  best price on {cheapMeta.label}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/try-on/$id"
                  params={{ id: product.id }}
                  className="inline-flex items-center gap-2 bg-[#ef4d23] text-white rounded-full px-5 py-2.5 text-[14px] hover:bg-[#d8401b] transition-colors"
                >
                  <Camera size={16} /> Try On AR
                </Link>
                <a
                  href={cheapest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0b0f1a] text-white rounded-full px-5 py-2.5 text-[14px]"
                >
                  Buy on {cheapMeta.label}
                </a>
              </div>

              {product.dimensions && (
                <div className="mt-5 text-[13px] text-neutral-600">
                  Size: <span className="text-neutral-900">{product.dimensions.cm} cm</span>{" "}
                  <span className="text-neutral-400">/ {product.dimensions.inches} in</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-[18px] font-medium text-neutral-900 mb-3">
              Price comparison
            </h2>
            <PriceComparisonTable product={product} />
          </div>

          {/* Review Summary Section */}
          <div className="mt-2">
            <ReviewSummary category={product.category} />
          </div>
        </div>
      </div>
    </div>
  );
}
