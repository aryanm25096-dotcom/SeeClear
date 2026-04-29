import { useEffect, useRef, useState } from 'react';
import { useCamera } from './useCamera';
import { useFaceMesh } from './useFaceMesh';
import { useHands } from './useHands';
import { drawMirroredVideo, renderLips, renderFoundation, renderBlush, renderHairColor, renderSunglasses, renderNails } from '../utils/arHelpers';
import type { Product } from '../data/products';

export function useAROverlay(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  product: Product | null
) {
  const { hasPermission, error, isInitializing, startCamera, stopCamera } = useCamera(videoRef);
  
  const isFaceRequired = !!(product?.category && ['lips', 'foundation', 'blush', 'haircolor', 'sunglasses'].includes(product.category));
  const isHandsRequired = product?.category === 'nails';

  const { faceMesh, isLoaded: isFaceMeshLoaded, setOnResults: setFaceResults } = useFaceMesh(isFaceRequired);
  const { hands, isLoaded: isHandsLoaded, setOnResults: setHandResults } = useHands(isHandsRequired);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setFaceResults((results) => {
      if (product?.category === 'nails') return; // Handled by Hands
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !videoRef.current) return;

      const video = videoRef.current;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMirroredVideo(ctx, video, canvas.width, canvas.height);

      if (!product) return;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const w = canvas.width;
        const h = canvas.height;
        
        const color = product.shade || (product.category === 'sunglasses' ? '#111111' : '#ff0000'); 
        
        switch (product.category) {
          case 'lips':
            renderLips(ctx, landmarks, w, h, color, 0.6);
            break;
          case 'foundation':
            renderFoundation(ctx, landmarks, w, h, color, 0.3);
            break;
          case 'blush':
            renderBlush(ctx, landmarks, w, h, color, 0.4);
            break;
          case 'haircolor':
            renderHairColor(ctx, landmarks, w, h, color, 0.5);
            break;
          case 'sunglasses':
            renderSunglasses(ctx, landmarks, w, h, color, 0.8);
            break;
        }
      }
    });
  }, [canvasRef, videoRef, product, setFaceResults]);

  useEffect(() => {
    setHandResults((results) => {
      if (product?.category !== 'nails') return; // Only process for nails
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !videoRef.current) return;

      const video = videoRef.current;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMirroredVideo(ctx, video, canvas.width, canvas.height);

      if (!product) return;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const w = canvas.width;
        const h = canvas.height;
        const color = product.shade || "#ff0000"; 
        
        for (const landmarks of results.multiHandLandmarks) {
          renderNails(ctx, landmarks, w, h, color, 0.8);
        }
      }
    });
  }, [canvasRef, videoRef, product, setHandResults]);

  useEffect(() => {
    if (!hasPermission || !videoRef.current) return;
    
    if (isFaceRequired && (!isFaceMeshLoaded || !faceMesh)) return;
    if (isHandsRequired && (!isHandsLoaded || !hands)) return;
    
    setIsProcessing(true);
    let lastVideoTime = -1;

    const tick = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          
          if (isHandsRequired && hands) {
            await hands.send({ image: video });
          } else if (isFaceRequired && faceMesh) {
            await faceMesh.send({ image: video });
          } else {
            // For categories without tracking, just draw the video
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
              }
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              drawMirroredVideo(ctx, video, canvas.width, canvas.height);
            }
          }
        }
      }
      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(requestRef.current);
      setIsProcessing(false);
    };
  }, [hasPermission, isFaceMeshLoaded, faceMesh, isHandsLoaded, hands, videoRef, product, canvasRef]);

  return { hasPermission, error, isInitializing, isProcessing, startCamera, stopCamera };
}
