import { TrendingDown, TrendingUp, X, ChevronDown } from "lucide-react";
import Gauge from "./Gauge";

function ClicksCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#ef4d23] font-medium">Clicks</span>
        <span className="text-neutral-500">This Month</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[28px] font-semibold text-neutral-900 leading-none">6,896</span>
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[11px]">
          <TrendingDown size={12} />
          -3,382 (33%)
        </span>
      </div>
      <div className="mt-1 text-[11px] text-neutral-500">Compared to yesterday</div>

      <div className="mt-4 text-center text-[12px] text-neutral-600">Month Target achieved</div>
      <Gauge value={92} color="#ef4d23" showLabels min="389K" max="425K" />

      <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-[12px]">
        <button className="flex-1 bg-white shadow-sm rounded-full py-1.5 text-neutral-900">
          Impressions
        </button>
        <button className="flex-1 py-1.5 text-neutral-600">Clicks</button>
      </div>
    </div>
  );
}

function FormCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700">Show figures for</label>
        <button className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center justify-between text-[13px] text-neutral-900">
          This month
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700">Compare period by</label>
        <button className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center justify-between text-[13px] text-neutral-900">
          Month-to-date (MTD)
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700">Ste targets (This month)</label>
        <div className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center gap-2 text-[13px]">
          <span className="text-neutral-400">#</span>
          <input
            defaultValue={10}
            className="flex-1 outline-none bg-transparent text-neutral-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] text-neutral-700">Ste targets (This year)</label>
        <div className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center gap-2 text-[13px]">
          <span className="text-neutral-400">#</span>
          <input
            defaultValue={100}
            className="flex-1 outline-none bg-transparent text-neutral-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-1">
        <button className="bg-[#ef4d23] text-white rounded-lg px-5 py-2 text-[13px]">Save</button>
        <button className="underline text-[13px] text-neutral-700">Cancel</button>
        <button aria-label="Close" className="ml-auto text-neutral-500">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function VideoStartsCard() {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#ef4d23] font-medium">Video Starts</span>
        <span className="text-neutral-500">today</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[28px] font-semibold text-neutral-900 leading-none">0</span>
        <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5 text-[11px]">
          <TrendingUp size={12} />0
        </span>
      </div>
      <div className="mt-1 text-[11px] text-neutral-500">Compared to yesterday</div>

      <div className="mt-4">
        <Gauge value={68} color="#9ca3af" />
      </div>

      <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-[12px]">
        <button className="flex-1 bg-white shadow-sm rounded-full py-1.5 text-neutral-900">
          Video Clicks
        </button>
        <button className="flex-1 py-1.5 text-neutral-600">Video Starts</button>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ClicksCard />
          <FormCard />
          <VideoStartsCard />
        </div>
      </div>
    </div>
  );
}
