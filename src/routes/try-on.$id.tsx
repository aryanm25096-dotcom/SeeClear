import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import CameraView from "@/app/components/CameraView";
import { getProductById } from "@/data/products";
import { platforms } from "@/data/platforms";
import { formatPrice, getCheapestPlatform } from "@/utils/priceCalculator";
import { useState } from "react";

export const Route = createFileRoute("/try-on/$id")({
  loader: ({ params }) => {
    const product = getProductById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Try On ${loaderData.product.name} — SeeClear` },
        ]
      : [{ title: "Try On — SeeClear" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black text-white">
      <h1 className="text-2xl font-medium">Product not found</h1>
      <Link to="/" className="text-[#ef4d23] underline">
        Back to home
      </Link>
    </div>
  ),
  component: TryOnPage,
});

function TryOnPage() {
  const { product: initialProduct } = Route.useLoaderData();
  const [product] = useState(initialProduct);

  const cheapest = getCheapestPlatform(product);
  const cheapMeta = platforms[cheapest.platform];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-black text-white w-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Main Camera Area */}
      <div className="relative flex-1 h-full p-2 sm:p-4 pb-0 sm:pb-4 flex flex-col">
         <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="absolute top-6 left-6 z-20 bg-black/50 p-2.5 rounded-full backdrop-blur-md hover:bg-black/80 text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <CameraView product={product} />
          {/* AR Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full z-20">
             <button className="flex items-center gap-2 text-sm text-neutral-200 hover:text-[#ef4d23] transition-colors">
                <Download size={18} /> Snapshot
             </button>
          </div>
      </div>
      
      {/* Side Panel */}
      <div className="w-full h-auto md:h-full md:w-80 lg:w-96 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800 p-6 flex flex-col overflow-y-auto">
         <div className="text-[12px] uppercase tracking-wide text-neutral-500 mb-1">{product.brand}</div>
         <h1 className="text-xl sm:text-2xl font-medium mb-4">{product.name}</h1>
         
         {product.shade && (
            <div className="mb-6">
              <h3 className="text-sm text-neutral-400 mb-3">Color Shade</h3>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-lg" style={{ backgroundColor: product.shade }}></div>
              </div>
            </div>
         )}
         
         <div className="mt-auto pt-6 border-t border-neutral-800">
           <div className="flex flex-col gap-1 mb-4">
             <span className="text-3xl font-semibold">{formatPrice(cheapest.total)}</span>
             <span className="text-sm text-neutral-400">Best price on {cheapMeta.label}</span>
           </div>
           
           <a
              href={cheapest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-full bg-[#ef4d23] hover:bg-[#d8401b] text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
           >
              Buy on {cheapMeta.label}
           </a>
         </div>
      </div>
    </div>
  );
}
