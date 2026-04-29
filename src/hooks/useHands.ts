import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Hands: any;
  }
}

export function useHands(enabled: boolean = true) {
  const [hands, setHands] = useState<any>(null);
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
        setHands(null);
        setIsLoaded(false);
      }
      return;
    }

    let checkInterval: ReturnType<typeof setInterval>;
    let cancelled = false;

    const initHands = () => {
      if (!window.Hands) {
        return false;
      }

      const h = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      h.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      h.onResults((results: any) => {
        if (onResultsCallbackRef.current) {
          onResultsCallbackRef.current(results);
        }
      });

      instanceRef.current = h;

      h.initialize().then(() => {
        if (!cancelled) {
          setHands(h);
          setIsLoaded(true);
        }
      }).catch((err: any) => {
        console.error("Failed to init Hands", err);
      });

      return true;
    };

    if (!initHands()) {
      checkInterval = setInterval(() => {
        if (initHands()) {
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
      setHands(null);
      setIsLoaded(false);
    };
  }, [enabled]);

  return { hands, isLoaded, setOnResults };
}
