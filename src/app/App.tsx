import "../styles/fonts.css";
import { ChevronRight, Camera, ShieldCheck } from "lucide-react";
import Navbar from "./components/Navbar";
import ProductExplorer from "./components/ProductExplorer";

export default function App() {
  return (
    <div
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* HERO — kept as the landing section */}
      <div className="relative w-full h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl">
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disableRemotePlayback
          {...({ "webkit-playsinline": "true", "x5-playsinline": "true" } as Record<string, string>)}
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-white/10" />

        <div className="relative z-10">
          <Navbar />

          <div className="flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#ef4d23]" />
              <span className="text-neutral-800">SeeClear — AR Shopping Assistant</span>
            </div>

            <h1
              className="mt-5 sm:mt-6 max-w-4xl text-neutral-900"
              style={{
                fontSize: "clamp(36px, 8vw, 72px)",
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Try before{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                you buy
              </span>
              <br />
              compare every price
            </h1>

            <p
              className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-xl"
              style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}
            >
              Live AR try-on for makeup, eyewear, and jewellery — with full price transparency
              across Nykaa, Amazon, Flipkart, Myntra and more.
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#explore"
                className="inline-flex items-center gap-3 bg-[#0b0f1a] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px]"
              >
                Explore products
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15">
                  <ChevronRight size={16} />
                </span>
              </a>
              <div className="hidden sm:flex items-center gap-4 text-[12px] text-neutral-700">
                <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5">
                  <Camera size={14} className="text-[#ef4d23]" /> Live AR try-on
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur rounded-full px-3 py-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> No hidden charges
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="explore">
        <ProductExplorer />
      </div>
    </div>
  );
}
