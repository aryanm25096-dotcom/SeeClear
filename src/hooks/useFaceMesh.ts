import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    FaceMesh: any;
  }
}

export function useFaceMesh(enabled: boolean = true) {
  const faceMeshRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onResultsCallbackRef = useRef<((results: any) => void) | null>(null);

  const setOnResults = (callback: (results: any) => void) => {
    onResultsCallbackRef.current = callback;
  };

  useEffect(() => {
    if (!enabled) return;

    let checkInterval: NodeJS.Timeout;

    const initFaceMesh = () => {
      if (!window.FaceMesh) {
        return false;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          if (file.includes('hands')) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results: any) => {
        if (onResultsCallbackRef.current) {
          onResultsCallbackRef.current(results);
        }
      });
      
      faceMeshRef.current = faceMesh;
      
      // Set a timeout to allow the WASM backend to initialize before marking as loaded
      faceMesh.initialize().then(() => {
        setIsLoaded(true);
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
      if (checkInterval) clearInterval(checkInterval);
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      setIsLoaded(false);
    };
  }, [enabled]);

  return { faceMesh: faceMeshRef.current, isLoaded, setOnResults };
}
