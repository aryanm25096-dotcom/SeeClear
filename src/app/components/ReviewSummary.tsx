import { useState } from "react";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  User,
} from "lucide-react";
import { platforms, type PlatformKey } from "@/data/platforms";

/* ---------- MOCK REVIEW DATA ---------- */

interface PlatformReviewSummary {
  platform: PlatformKey;
  avgRating: number;
  totalReviews: number;
  distribution: number[]; // [5-star, 4-star, 3-star, 2-star, 1-star] percentages
}

interface ReviewHighlight {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  count: number;
}

interface IndividualReview {
  platform: PlatformKey;
  author: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
  verified: boolean;
}

function generateReviewData(category: string): {
  overallRating: number;
  totalReviews: number;
  platformSummaries: PlatformReviewSummary[];
  aiSummary: string;
  highlights: ReviewHighlight[];
  topReviews: IndividualReview[];
} {
  // Only lip shade products exist now
  const isMakeup = true;

  return {
    overallRating: 4.3,
    totalReviews: 8420,
    platformSummaries: [
      { platform: "nykaa", avgRating: 4.3, totalReviews: 2841, distribution: [52, 28, 12, 5, 3] },
      { platform: "amazon", avgRating: 4.5, totalReviews: 12430, distribution: [58, 25, 10, 4, 3] },
      { platform: "flipkart", avgRating: 4.1, totalReviews: 8920, distribution: [45, 30, 14, 7, 4] },
      { platform: "myntra", avgRating: 4.2, totalReviews: 3510, distribution: [48, 27, 15, 6, 4] },
    ],
    aiSummary: "Highly rated across all platforms. Users love the long-lasting formula and rich pigmentation. Common praise includes vibrant color payoff and comfortable wear. A few reviewers note it can feel slightly drying after 6+ hours. Overall, an excellent product for daily and evening use.",
    highlights: isMakeup
      ? [
          { text: "Long-lasting formula", sentiment: "positive", count: 2340 },
          { text: "Rich color payoff", sentiment: "positive", count: 1890 },
          { text: "Comfortable to wear", sentiment: "positive", count: 1560 },
          { text: "Great value", sentiment: "positive", count: 1120 },
          { text: "Slightly drying", sentiment: "negative", count: 340 },
          { text: "Packaging could be better", sentiment: "neutral", count: 210 },
        ]
      : [
          { text: "Premium build quality", sentiment: "positive", count: 1800 },
          { text: "UV protection", sentiment: "positive", count: 1450 },
          { text: "Comfortable fit", sentiment: "positive", count: 1200 },
          { text: "Classic design", sentiment: "positive", count: 980 },
          { text: "Slightly pricey", sentiment: "negative", count: 420 },
          { text: "Authentic product", sentiment: "positive", count: 890 },
        ],
    topReviews: [
      {
        platform: "amazon",
        author: "Priya M.",
        rating: 5,
        date: "Apr 12, 2026",
        text: isMakeup
          ? "Absolutely love this! The color is exactly as shown and lasts all day. I've been using MAC for years and this shade is my go-to. Highly recommend for anyone looking for a bold, professional look."
          : "Perfect sunglasses. The build quality is outstanding and they fit perfectly. Worth every rupee. The UV protection is great for Indian summers.",
        helpful: 142,
        verified: true,
      },
      {
        platform: "nykaa",
        author: "Sneha R.",
        rating: 4,
        date: "Apr 8, 2026",
        text: isMakeup
          ? "Great lipstick with amazing pigmentation. Only reason I'm giving 4 stars is because it gets a tiny bit dry after 6-7 hours. But the color payoff is unmatched!"
          : "Good sunglasses overall. Stylish and comfortable. Delivery from Nykaa was super fast. Wish the case was a bit more premium.",
        helpful: 89,
        verified: true,
      },
      {
        platform: "flipkart",
        author: "Rahul K.",
        rating: 5,
        date: "Mar 28, 2026",
        text: isMakeup
          ? "Bought this as a gift for my wife and she absolutely loved it. The packaging is premium and the shade is beautiful. Fast delivery too!"
          : "Excellent product. I compared prices on SeeClear and Flipkart had the best deal. The glasses are lightweight and the polarization is excellent.",
        helpful: 67,
        verified: true,
      },
    ],
  };
}

/* ---------- COMPONENT ---------- */

export default function ReviewSummary({ category }: { category: string }) {
  const [showAll, setShowAll] = useState(false);
  const data = generateReviewData(category);

  const renderStars = (rating: number, size: number = 12) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.floor(rating) ? "text-amber-500 fill-amber-500" : i < rating ? "text-amber-500 fill-amber-200" : "text-neutral-300"}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-5 mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-[#ef4d23]" />
        <h2 className="text-[18px] font-medium text-neutral-900">Review Summary</h2>
        <span className="text-[12px] text-neutral-400 ml-1">
          Aggregated from {data.platformSummaries.length} platforms
        </span>
      </div>

      {/* AI Summary Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#ef4d23]" />
          <span className="text-[13px] font-medium">AI-Generated Summary</span>
        </div>
        <p className="text-neutral-300 text-[13px] leading-relaxed">{data.aiSummary}</p>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            {renderStars(data.overallRating, 14)}
            <span className="text-[15px] font-medium">{data.overallRating}</span>
          </div>
          <span className="text-neutral-500 text-[12px]">
            Based on {data.totalReviews.toLocaleString()} reviews
          </span>
        </div>
      </div>

      {/* Review Highlights (Tags) */}
      <div>
        <h3 className="text-[13px] font-medium text-neutral-900 mb-2.5 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-neutral-500" /> What people mention most
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.highlights.map((h) => (
            <span
              key={h.text}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                h.sentiment === "positive"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : h.sentiment === "negative"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
              }`}
            >
              {h.sentiment === "positive" ? <ThumbsUp size={11} /> : h.sentiment === "negative" ? <ThumbsDown size={11} /> : null}
              {h.text}
              <span className="text-[10px] opacity-70">({h.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Platform Ratings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {data.platformSummaries.map((ps) => {
          const meta = platforms[ps.platform];
          return (
            <div key={ps.platform} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-center">
              <span className="text-lg">{meta.logo}</span>
              <div className="text-[12px] font-medium text-neutral-900 mt-1">{meta.label}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {renderStars(ps.avgRating, 10)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{ps.avgRating} ({ps.totalReviews.toLocaleString()})</div>
              {/* Mini bar chart */}
              <div className="space-y-0.5 mt-2">
                {ps.distribution.map((pct, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-[9px] text-neutral-400 w-3">{5 - i}</span>
                    <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : i < 3 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-neutral-400 w-6 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Reviews */}
      <div>
        <h3 className="text-[13px] font-medium text-neutral-900 mb-3">Top Reviews</h3>
        <div className="space-y-3">
          {(showAll ? data.topReviews : data.topReviews.slice(0, 2)).map((review, i) => {
            const meta = platforms[review.platform];
            return (
              <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                    <User size={14} className="text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-neutral-900">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span style={{ color: meta.color }}>{meta.logo} {meta.label}</span>
                      · {review.date}
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="text-[13px] text-neutral-700 leading-relaxed">{review.text}</p>
                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-neutral-200">
                  <button className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-700">
                    <ThumbsUp size={12} /> Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {data.topReviews.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1 mt-3 text-[13px] text-[#ef4d23] hover:text-[#d8401b] font-medium"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={14} /></>
            ) : (
              <>Show All Reviews <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
