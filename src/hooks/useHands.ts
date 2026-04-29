import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Hands: any;
  }
}

export function useHands(enabled: boolean = true) {
  const handsRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onResultsCallbackRef = useRef<((results: any) => void) | null>(null);

  const setOnResults = (callback: (results: any) => void) => {
    onResultsCallbackRef.current = callback;
  };

  useEffect(() => {
    if (!enabled) return;
    
    let checkInterval: NodeJS.Timeout;

    const initHands = () => {
      if (!window.Hands) {
        return false;
      }

      const hands = new window.Hands({
        locateFile: (file: string) => {
          if (file.includes('face_mesh')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (onResultsCallbackRef.current) {
          onResultsCallbackRef.current(results);
        }
      });
      
      handsRef.current = hands;
      
      // Set a timeout to allow the WASM backend to initialize before marking as loaded
      hands.initialize().then(() => {
        setIsLoaded(true);
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
      if (checkInterval) clearInterval(checkInterval);
      if (handsRef.current) {
        handsRef.current.close();
      }
      setIsLoaded(false);
    };
  }, [enabled]);

  return { hands: handsRef.current, isLoaded, setOnResults };
}
