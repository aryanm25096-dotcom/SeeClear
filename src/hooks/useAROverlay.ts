import { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useFaceMesh } from './useFaceMesh';
import { useHands } from './useHands';
import {
  drawMirroredVideo,
  renderLips,
  renderFoundation,
  renderBlush,
  renderHairColor,
  renderSunglasses,
  renderNails,
  renderRing,
  renderBracelet,
  renderNecklace,
  preloadOverlayImage,
} from '../utils/arHelpers';
import type { Product } from '../data/products';

export function useAROverlay(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  product: Product | null
) {
  const { hasPermission, error, isInitializing, startCamera, stopCamera } = useCamera(videoRef);

  const isFaceRequired = !!(
    product?.category &&
    ['lips', 'foundation', 'blush', 'haircolor', 'sunglasses'].includes(product.category)
  ) || product?.arType === 'body';

  const isHandsRequired =
    product?.category === 'nails' ||
    product?.arType === 'finger' ||
    product?.arType === 'wrist';

  const { faceMesh, isLoaded: isFaceMeshLoaded, setOnResults: setFaceResults } = useFaceMesh(isFaceRequired);
  const { hands,    isLoaded: isHandsLoaded,    setOnResults: setHandResults  } = useHands(isHandsRequired);

  const [isProcessing, setIsProcessing] = useState(false);
  const requestRef = useRef<number>(0);

  const productRef = useRef(product);
  productRef.current = product;

  const isFaceRequiredRef = useRef(isFaceRequired);
  isFaceRequiredRef.current = isFaceRequired;

  const isHandsRequiredRef = useRef(isHandsRequired);
  isHandsRequiredRef.current = isHandsRequired;

  // ── Preload overlay image as soon as the product changes ─────────────────
  useEffect(() => {
    if (product?.overlayImage) {
      preloadOverlayImage(product.overlayImage);
    }
  }, [product?.overlayImage]);

  // ── Face results handler ──────────────────────────────────────────────────
  const handleFaceResults = useCallback((results: any) => {
    if (!isFaceRequiredRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!canvas || !ctx || !videoRef.current) return;

    const video = videoRef.current;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMirroredVideo(ctx, video, canvas.width, canvas.height);

    const p = productRef.current;
    if (!p) return;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const w = canvas.width;
      const h = canvas.height;

      const color = p.shade || (p.category === 'sunglasses' ? '#111111' : '#ff0000');

      switch (p.category) {
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
          // Higher intensity so colour is visible; tweak per-shade in products.ts if needed
          renderHairColor(ctx, landmarks, w, h, color, 0.75);
          break;

        case 'sunglasses':
          // Pass the product's overlayImage — renderSunglasses loads & caches it
          renderSunglasses(ctx, landmarks, w, h, color, 0.9, p.overlayImage);
          break;

        case 'jewellery':
          if (p.arType === 'body') {
            renderNecklace(ctx, landmarks, w, h, p.shade || '#FFFFFF', p.overlayImage);
          }
          break;

        default:
          break;
      }
    }
  }, [canvasRef, videoRef]);

  // ── Hand results handler ──────────────────────────────────────────────────
  const handleHandResults = useCallback((results: any) => {
    if (!isHandsRequiredRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext('2d');
    if (!canvas || !ctx || !videoRef.current) return;

    const video = videoRef.current;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMirroredVideo(ctx, video, canvas.width, canvas.height);

    const p = productRef.current;
    if (!p) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const w     = canvas.width;
      const h     = canvas.height;
      const color = p.shade || '#FFD700';

      for (const landmarks of results.multiHandLandmarks) {
        if (p.category === 'nails') {
          renderNails(ctx, landmarks, w, h, color, 0.8);
        } else if (p.arType === 'finger') {
          renderRing(ctx, landmarks, w, h, p.shade || '#FFD700', p.overlayImage);
        } else if (p.arType === 'wrist') {
          renderBracelet(ctx, landmarks, w, h, p.shade || '#C0C0C0', p.overlayImage);
        }
      }
    }
  }, [canvasRef, videoRef]);

  // ── Register callbacks ────────────────────────────────────────────────────
  useEffect(() => { setFaceResults(handleFaceResults); }, [setFaceResults, handleFaceResults]);
  useEffect(() => { setHandResults(handleHandResults); }, [setHandResults, handleHandResults]);

  // ── Main rAF processing loop ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasPermission || !videoRef.current) return;
    if (isFaceRequired  && (!isFaceMeshLoaded || !faceMesh)) return;
    if (isHandsRequired && (!isHandsLoaded    || !hands))    return;

    setIsProcessing(true);
    let lastVideoTime = -1;

    const tick = async () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          try {
            if (isHandsRequired && hands) {
              await hands.send({ image: video });
            } else if (isFaceRequired && faceMesh) {
              await faceMesh.send({ image: video });
            } else {
              // No tracking needed (toys etc.) — just mirror the video
              const canvas = canvasRef.current;
              const ctx    = canvas?.getContext('2d');
              if (canvas && ctx) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                  canvas.width  = video.videoWidth;
                  canvas.height = video.videoHeight;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawMirroredVideo(ctx, video, canvas.width, canvas.height);
              }
            }
          } catch (err) {
            console.warn('AR frame skipped:', err);
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
  }, [
    hasPermission,
    isFaceRequired, isFaceMeshLoaded, faceMesh,
    isHandsRequired, isHandsLoaded, hands,
    videoRef, canvasRef,
  ]);

  const isModelLoading =
    hasPermission === true &&
    !isInitializing &&
    ((isFaceRequired  && !isFaceMeshLoaded) ||
     (isHandsRequired && !isHandsLoaded));

  return { hasPermission, error, isInitializing, isProcessing, isModelLoading, startCamera, stopCamera };
}