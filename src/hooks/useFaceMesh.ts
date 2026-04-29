import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    FaceMesh: any;
  }
}

export function useFaceMesh(enabled: boolean = true) {
  const [faceMesh, setFaceMesh] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onResultsCallbackRef = useRef<((results: any) => void) | null>(null);
  const instanceRef = useRef<any>(null);

  const setOnResults = useCallback((callback: (results: any) => void) => {
    onResultsCallbackRef.current = callback;
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up if we were previously enabled
      if (instanceRef.current) {
        instanceRef.current.close();
        instanceRef.current = null;
        setFaceMesh(null);
        setIsLoaded(false);
      }
      return;
    }

    let checkInterval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const initFaceMesh = () => {
      if (!window.FaceMesh) {
        return false;
      }

      const fm = new window.FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      fm.onResults((results: any) => {
        if (onResultsCallbackRef.current) {
          onResultsCallbackRef.current(results);
        }
      });

      instanceRef.current = fm;

      fm.initialize().then(() => {
        if (!cancelled) {
          setFaceMesh(fm);
          setIsLoaded(true);
        }
      }).catch((err: any) => {
        console.error("Failed to init FaceMesh", err);
      });

      return true;
    };

    if (!initFaceMesh()) {
      checkInterval = setInterval(() => {
        if (initFaceMesh()) {
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      cancelled = true;
      if (checkInterval) clearInterval(checkInterval);
      if (instanceRef.current) {
        instanceRef.current.close();
        instanceRef.current = null;
      }
      setFaceMesh(null);
      setIsLoaded(false);
    };
  }, [enabled]);

  return { faceMesh, isLoaded, setOnResults };
}
