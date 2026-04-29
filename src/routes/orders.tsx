import "../styles/fonts.css";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  RotateCw,
  ExternalLink,
  ShoppingBag,
  Filter,
  Search,
  AlertCircle,
  Box,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { platforms, type PlatformKey } from "@/data/platforms";
import { formatPrice } from "@/utils/priceCalculator";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order Tracking — SeeClear" },
      {
        name: "description",
        content: "Track all your orders from Nykaa, Amazon, Flipkart, Myntra and more in one place.",
      },
    ],
  }),
  component: OrdersPage,
});

/* ---------- MOCK DATA ---------- */

type OrderStatus = "ordered" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  productName: string;
  brand: string;
  image: string;
  platform: PlatformKey;
  total: number;
  orderDate: string;
  estimatedDelivery: string;
  status: OrderStatus;
  trackingId: string;
  statusHistory: { status: string; date: string; location: string }[];
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: "ORD-2026-001",
    productName: "MAC Retro Matte Lipstick — Ruby Woo",
    brand: "MAC",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=70",
    platform: "nykaa",
    total: 1007,
    orderDate: "Apr 25, 2026",
    estimatedDelivery: "Apr 30, 2026",
    status: "shipped",
    trackingId: "NYK7892341",
    statusHistory: [
      { status: "Ordered", date: "Apr 25, 10:30 AM", location: "Online" },
      { status: "Packed", date: "Apr 26, 02:15 PM", location: "Nykaa Warehouse, Mumbai" },
      { status: "Shipped", date: "Apr 27, 09:00 AM", location: "Mumbai Sorting Hub" },
    ],
  },
  {
    id: "ORD-2026-002",
    productName: "Ray-Ban Aviator Classic RB3025",
    brand: "Ray-Ban",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=70",
    platform: "amazon",
    total: 6990,
    orderDate: "Apr 22, 2026",
    estimatedDelivery: "Apr 28, 2026",
    status: "out_for_delivery",
    trackingId: "AMZ-IN-892734",
    statusHistory: [
      { status: "Ordered", date: "Apr 22, 11:00 AM", location: "Online" },
      { status: "Packed", date: "Apr 23, 06:30 AM", location: "Amazon FC, Bangalore" },
      { status: "Shipped", date: "Apr 24, 08:00 AM", location: "Bangalore Hub" },
      { status: "In Transit", date: "Apr 26, 03:00 PM", location: "Delhi Hub" },
      { status: "Out for Delivery", date: "Apr 28, 07:30 AM", location: "Local Delivery Partner" },
    ],
  },
  {
    id: "ORD-2026-003",
    productName: "Lakmé True Wear Nail Color — Red",
    brand: "Lakmé",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=70",
    platform: "flipkart",
    total: 299,
    orderDate: "Apr 18, 2026",
    estimatedDelivery: "Apr 22, 2026",
    status: "delivered",
    trackingId: "FKT99812",
    statusHistory: [
      { status: "Ordered", date: "Apr 18, 09:00 AM", location: "Online" },
      { status: "Shipped", date: "Apr 19, 10:00 AM", location: "Flipkart Warehouse" },
      { status: "Delivered", date: "Apr 21, 01:30 PM", location: "Home" },
    ],
  },
  {
    id: "ORD-2026-004",
    productName: "NARS Blush — Orgasm",
    brand: "NARS",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=70",
    platform: "myntra",
    total: 3696,
    orderDate: "Apr 27, 2026",
    estimatedDelivery: "May 2, 2026",
    status: "ordered",
    trackingId: "MYN-456123",
    statusHistory: [
      { status: "Ordered", date: "Apr 27, 08:00 PM", location: "Online" },
    ],
  },
  {
    id: "ORD-2026-005",
    productName: "Maybelline Fit Me Foundation — 128",
    brand: "Maybelline",
    image: "https://images.unsplash.com/photo-1631214524020-7b6d6cb84d23?w=400&q=70",
    platform: "blinkit",
    total: 599,
    orderDate: "Apr 28, 2026",
    estimatedDelivery: "Apr 28, 2026",
    status: "delivered",
    trackingId: "BLK-001928",
    statusHistory: [
      { status: "Ordered", date: "Apr 28, 11:00 AM", location: "Online" },
      { status: "Picked Up", date: "Apr 28, 11:05 AM", location: "Blinkit Dark Store" },
      { status: "Delivered", date: "Apr 28, 11:18 AM", location: "Home" },
    ],
  },
];

/* ---------- HELPERS ---------- */

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string; icon: typeof Package }> = {
  ordered: { label: "Ordered", color: "text-blue-600", bg: "bg-blue-50", icon: ShoppingBag },
  shipped: { label: "Shipped", color: "text-amber-600", bg: "bg-amber-50", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-600", bg: "bg-orange-50", icon: MapPin },
  delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "ordered", label: "Ordered" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

/* ---------- COMPONENT ---------- */

function OrdersPage() {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = MOCK_ORDERS.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.productName.toLowerCase().includes(q) ||
        o.brand.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.trackingId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="relative w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
        <Navbar />

        <div className="px-4 sm:px-8 pt-6 pb-16 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <Link to="/" className="inline-flex items-center gap-1 text-[13px] text-neutral-400 hover:text-neutral-600 mb-2">
                <ArrowLeft size={14} /> Back to Home
              </Link>
              <h1 className="text-[28px] sm:text-[36px] font-medium text-neutral-900" style={{ letterSpacing: "-0.02em" }}>
                My Orders
              </h1>
              <p className="text-neutral-500 text-[14px] mt-1">Track all your orders across platforms in one dashboard.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 rounded-full px-3 py-1.5 text-[12px]">
                <Package size={14} /> {MOCK_ORDERS.length} orders
              </span>
              <button className="inline-flex items-center gap-1.5 bg-[#ef4d23] hover:bg-[#d8401b] text-white rounded-full px-4 py-2 text-[13px] font-medium transition-colors">
                <Plus size={14} /> Add Order
              </button>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, brands, or tracking IDs..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-[#ef4d23]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    filter === f.key
                      ? "bg-[#0b0f1a] text-white border-[#0b0f1a]"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Box size={48} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500 text-[14px]">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => {
                const statusInfo = STATUS_MAP[order.status];
                const StatusIcon = statusInfo.icon;
                const isExpanded = expanded === order.id;
                const meta = platforms[order.platform];

                return (
                  <div
                    key={order.id}
                    className={`border rounded-xl overflow-hidden transition-all ${isExpanded ? "border-neutral-300 shadow-sm" : "border-neutral-200"}`}
                  >
                    {/* Main Row */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-50/50 transition-colors"
                    >
                      <img src={order.image} alt={order.productName} className="w-14 h-14 rounded-lg object-cover shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] text-neutral-400">{order.id}</span>
                          <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: meta.color }}>
                            {meta.logo} {meta.label}
                          </span>
                        </div>
                        <div className="text-[14px] font-medium text-neutral-900 truncate">{order.productName}</div>
                        <div className="text-[12px] text-neutral-500 mt-0.5">
                          {order.brand} · Ordered {order.orderDate}
                        </div>
                      </div>

                      <div className="hidden sm:block text-right shrink-0">
                        <div className="text-[14px] font-medium text-neutral-900">{formatPrice(order.total)}</div>
                        <div className="text-[11px] text-neutral-500">Est. {order.estimatedDelivery}</div>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color} rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </div>

                      <ChevronRight
                        size={16}
                        className={`text-neutral-400 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {/* Expanded Timeline */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-5 animate-[fadeIn_0.3s_ease-out]">
                        <div className="sm:hidden flex items-center justify-between mb-4">
                          <span className="text-[14px] font-medium">{formatPrice(order.total)}</span>
                          <span className="text-[12px] text-neutral-500">Est. {order.estimatedDelivery}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-1 mb-5">
                          {(["ordered", "shipped", "out_for_delivery", "delivered"] as OrderStatus[]).map((step, i) => {
                            const steps: OrderStatus[] = ["ordered", "shipped", "out_for_delivery", "delivered"];
                            const currentIdx = steps.indexOf(order.status);
                            const isComplete = i <= currentIdx;
                            return (
                              <div key={step} className="flex-1 flex items-center gap-1">
                                <div className={`w-full h-1.5 rounded-full ${isComplete ? "bg-emerald-500" : "bg-neutral-200"}`} />
                              </div>
                            );
                          })}
                        </div>

                        {/* Timeline */}
                        <div className="space-y-0 pl-3 border-l-2 border-neutral-200 ml-1">
                          {order.statusHistory.map((entry, i) => (
                            <div key={i} className="relative pb-4 last:pb-0 pl-5">
                              <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 ${i === order.statusHistory.length - 1 ? "bg-[#ef4d23] border-[#ef4d23]" : "bg-white border-neutral-300"}`} />
                              <div className="text-[13px] font-medium text-neutral-900">{entry.status}</div>
                              <div className="text-[11px] text-neutral-500">
                                {entry.date} · {entry.location}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200">
                          <span className="text-[11px] text-neutral-500 mr-auto">Tracking: {order.trackingId}</span>
                          <button className="inline-flex items-center gap-1 text-[12px] text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg px-3 py-1.5 transition-colors">
                            <RotateCw size={12} /> Refresh
                          </button>
                          <button className="inline-flex items-center gap-1 text-[12px] text-white bg-[#0b0f1a] hover:bg-neutral-800 rounded-lg px-3 py-1.5 transition-colors">
                            <ExternalLink size={12} /> Track on {meta.label}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
