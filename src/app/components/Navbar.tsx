import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ShoppingCart, Menu, X } from "lucide-react";

function Logo({ className = "w-7 h-7 sm:w-8 sm:h-8" }: { className?: string }) {
  const cx = 16;
  const cy = 16;
  const r = 10;
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return <circle key={i} cx={x} cy={y} r={3.5} fill="#ef4d23" />;
  });
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {petals}
      <circle cx={cx} cy={cy} r={3.5} fill="#ef4d23" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Home", dot: true, to: "/" as const },
  { label: "Track Price", to: "/track" as const },
  { label: "My Orders", to: "/orders" as const },
  { label: "Categories", orange: true, to: "/" as const },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4">
      <nav className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center">
        {/* Logo */}
        <div className="shrink-0 flex items-center pl-2">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 ml-6 text-[14px] text-neutral-900">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-1.5 hover:text-[#ef4d23] transition-colors ${item.orange ? "text-[#ef4d23]" : ""}`}
            >
              {item.dot && (
                <span className="inline-block w-[1.5px] h-[1.5px] rounded-full bg-black" style={{ width: 4, height: 4 }} />
              )}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/orders"
            aria-label="Orders"
            className="hidden md:inline-flex items-center justify-center w-8 h-8 text-neutral-800 hover:text-[#ef4d23] transition-colors"
          >
            <ShoppingCart size={18} />
          </Link>

          <Link
            to="/track"
            className="inline-flex items-center gap-2 bg-[#ef4d23] text-white rounded-full pl-4 pr-1 py-1 text-[13px] sm:text-[14px] hover:bg-[#d8401b] transition-colors"
          >
            <span className="hidden sm:inline">Track a Product</span>
            <span className="sm:hidden">Track</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <ChevronRight size={14} />
            </span>
          </Link>

          <button
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-neutral-800"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-20 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] hover:bg-neutral-50 ${item.orange ? "text-[#ef4d23]" : "text-neutral-900"}`}
              >
                {item.dot && <span className="inline-block rounded-full bg-black" style={{ width: 4, height: 4 }} />}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
