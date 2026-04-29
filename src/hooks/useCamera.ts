import { useEffect, useState, RefObject, useCallback, useRef } from 'react';

export function useCamera(videoRef: RefObject<HTMLVideoElement | null>) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setIsInitializing(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = mediaStream;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.playsInline = true;
      
      if (videoRef.current.readyState >= 1) {
        // Metadata is already loaded
      } else {
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          const handler = () => {
            if (videoRef.current) {
              videoRef.current.removeEventListener('loadedmetadata', handler);
            }
            resolve();
          };
          videoRef.current.addEventListener('loadedmetadata', handler);
        });
      }

      await videoRef.current.play();
      setHasPermission(true);
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError(err.message || "Permission denied");
      setIsInitializing(false);
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { hasPermission, error, isInitializing, startCamera, stopCamera };
}
