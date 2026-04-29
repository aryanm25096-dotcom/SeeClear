import React, { useRef, useEffect } from 'react';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useAROverlay } from '@/hooks/useAROverlay';
import { Product } from '@/data/products';

interface CameraViewProps {
  product: Product;
}

export default function CameraView({ product }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { hasPermission, error, isInitializing, isProcessing, isModelLoading, startCamera } = useAROverlay(videoRef, canvasRef, product);

  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        className="absolute opacity-0 w-[1px] h-[1px] -z-10"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
      
      {/* State 1: Camera not started — show start prompt */}
      {hasPermission === null && !isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
            <Camera size={32} className="text-neutral-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">AR Try-On</h3>
          <p className="text-neutral-400 max-w-sm mb-6">
            SeeClear needs camera access to overlay the product on your face or hands. We don't save or transmit any video data.
          </p>
          <button
            onClick={startCamera}
            className="bg-[#ef4d23] hover:bg-[#d8401b] transition-colors text-white px-6 py-3 rounded-full font-medium"
          >
            Start Camera
          </button>
        </div>
      )}

      {/* State 2: Camera stream being acquired */}
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-10 text-white">
          <Loader2 size={48} className="animate-spin text-[#ef4d23] mb-4" />
          <p className="text-sm font-medium animate-pulse">Starting Camera...</p>
        </div>
      )}

      {/* State 3: Camera denied */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Camera Access Denied</h3>
          <p className="text-neutral-400 max-w-sm mb-4">
            {error || "Please allow camera permissions in your browser settings to use the AR try-on feature."}
          </p>
          <div className="text-xs text-neutral-500 bg-neutral-800 p-4 rounded-lg text-left max-w-sm w-full">
            <p className="font-semibold mb-2">How to fix:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Chrome: Click the lock icon in the address bar and set Camera to Allow.</li>
              <li>Safari: Go to Settings &gt; Safari &gt; Camera and select Allow.</li>
              <li>Refresh the page after updating.</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-white text-black px-6 py-2 rounded-full font-medium"
          >
            Refresh Page
          </button>
        </div>
      )}

      {/* State 4: Camera ready, MediaPipe model still loading */}
      {isModelLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="relative">
            {/* Pulsing load ring */}
            <div className="absolute -inset-12 border-2 border-[#ef4d23]/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute -inset-8 border border-white/10 rounded-full animate-[spin_6s_linear_infinite]" />
            
            <div className="bg-black/60 backdrop-blur-lg text-white text-sm px-6 py-3 rounded-full border border-white/10 shadow-2xl shadow-black/50 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#ef4d23]" />
              <span className="font-medium tracking-wide text-white/90">
                Loading AR Engine...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* State 5: Everything ready, waiting for face/hand detection */}
      {hasPermission && !isProcessing && !isInitializing && !isModelLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="relative">
            {/* Animated scanning rings */}
            <div className="absolute -inset-8 border border-dashed border-white/20 rounded-full animate-[spin_8s_linear_infinite]" />
            <div className="absolute -inset-8 border border-transparent border-t-[#ef4d23] rounded-full animate-[spin_3s_linear_infinite] opacity-70" />
            
            {/* Status Pill */}
            <div className="bg-black/50 backdrop-blur-md text-white text-sm px-6 py-3 rounded-full border border-white/10 shadow-2xl shadow-black/50 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#ef4d23]" />
              <span className="font-medium tracking-wide text-white/90">
                Align {product.category === 'nails' || product.arType === 'finger' || product.arType === 'wrist' ? 'Hands' : 'Face'} in View
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* State 6: Actively tracking — show live indicator */}
      {hasPermission && isProcessing && (
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-white/90 text-xs font-medium tracking-wider uppercase">Live Tracking</span>
          </div>
        </div>
      )}
    </div>
  );
}
