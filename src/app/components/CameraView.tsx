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
  
  const { hasPermission, error, isInitializing, isProcessing, startCamera } = useAROverlay(videoRef, canvasRef, product);

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
      
      {/* Overlay UI based on state */}
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

      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-10 text-white">
          <Loader2 size={48} className="animate-spin text-[#ef4d23] mb-4" />
          <p className="text-sm font-medium animate-pulse">Initializing AR Engine...</p>
        </div>
      )}

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

      {hasPermission && !isProcessing && !isInitializing && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded border border-yellow-500/30">
            Waiting for Tracking...
          </span>
        </div>
      )}
      
      {hasPermission && isProcessing && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded border border-emerald-500/30">
            AR Active
          </span>
        </div>
      )}
    </div>
  );
}
