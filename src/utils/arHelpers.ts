export function hexToRGBA(hex: string, alpha: number = 1): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function drawMirroredVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number
) {
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
}

export function getCanvasCoords(
  landmark: { x: number; y: number },
  width: number,
  height: number,
  mirror: boolean = true
) {
  const x = mirror ? (1 - landmark.x) * width : landmark.x * width;
  return { x, y: landmark.y * height };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function getDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// ─── Lips ────────────────────────────────────────────────────────────────────
const LIP_LOWER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];
const LIP_UPPER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];

export function renderLips(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.6
) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = hexToRGBA(color, intensity);

  ctx.beginPath();
  LIP_LOWER.forEach((idx, i) => {
    const p = getCanvasCoords(landmarks[idx], width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  LIP_UPPER.forEach((idx, i) => {
    const p = getCanvasCoords(landmarks[idx], width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Foundation ───────────────────────────────────────────────────────────────
export function renderFoundation(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.3
) {
  const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = hexToRGBA(color, intensity);

  ctx.beginPath();
  FACE_OVAL.forEach((idx, i) => {
    const p = getCanvasCoords(landmarks[idx], width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Blush ────────────────────────────────────────────────────────────────────
export function renderBlush(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.4
) {
  const LEFT_CHEEK = 205;
  const RIGHT_CHEEK = 425;
  const FACE_WIDTH = getDistance(
    getCanvasCoords(landmarks[234], width, height),
    getCanvasCoords(landmarks[454], width, height)
  );

  const radius = FACE_WIDTH * 0.15;

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  [LEFT_CHEEK, RIGHT_CHEEK].forEach((idx) => {
    const p = getCanvasCoords(landmarks[idx], width, height);
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    grad.addColorStop(0, hexToRGBA(color, intensity));
    grad.addColorStop(1, hexToRGBA(color, 0));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ─── Hair Color (FIXED) ───────────────────────────────────────────────────────
// Uses forehead + temples to define the hair region correctly.
// The gradient now goes FROM forehead edge UPWARD (out of frame),
// so the hair above the head gets coloured rather than the forehead.
export function renderHairColor(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.75        // raised from 0.5 for visibility
) {
  // Forehead/hairline landmarks
  const leftTemple  = getCanvasCoords(landmarks[103], width, height);
  const rightTemple = getCanvasCoords(landmarks[332], width, height);
  const foreheadTop = getCanvasCoords(landmarks[10],  width, height);   // top-centre
  const leftSide    = getCanvasCoords(landmarks[234], width, height);   // ear level left
  const rightSide   = getCanvasCoords(landmarks[454], width, height);   // ear level right

  // How wide the face is — used to estimate how far above the head to paint
  const faceWidth = getDistance(leftSide, rightSide);

  // The hair region starts at the hairline (foreheadTop.y) and goes UP
  const hairStartY = foreheadTop.y;            // where forehead meets hair
  const hairEndY   = Math.max(0, hairStartY - faceWidth * 0.9); // ~90% face-width above

  ctx.save();

  // "multiply" washes out on dark hair; "overlay" or "color" works better
  // We composite a translucent fill so the underlying hair texture shows through
  ctx.globalCompositeOperation = "overlay";

  // Gradient: opaque at hairline, fades to transparent higher up
  const grad = ctx.createLinearGradient(0, hairStartY, 0, hairEndY);
  grad.addColorStop(0, hexToRGBA(color, intensity));
  grad.addColorStop(0.6, hexToRGBA(color, intensity * 0.7));
  grad.addColorStop(1,   hexToRGBA(color, 0));

  ctx.fillStyle = grad;

  // Draw a curved shape that follows the hairline
  ctx.beginPath();
  // Start at left temple
  ctx.moveTo(leftTemple.x, leftTemple.y);
  // Arc across the top of the head (bezier through foreheadTop)
  ctx.quadraticCurveTo(
    foreheadTop.x,
    hairEndY,           // control point pulled up to the top of the hair region
    rightTemple.x,
    rightTemple.y
  );
  // Come back down along the forehead edge (straight line)
  ctx.lineTo(foreheadTop.x + faceWidth * 0.5, hairStartY);
  ctx.quadraticCurveTo(foreheadTop.x, hairStartY + 5, leftTemple.x, leftTemple.y);
  ctx.closePath();
  ctx.fill();

  // Second pass with "multiply" for deeper saturation on lighter hair
  ctx.globalCompositeOperation = "multiply";
  const grad2 = ctx.createLinearGradient(0, hairStartY, 0, hairEndY);
  grad2.addColorStop(0, hexToRGBA(color, intensity * 0.5));
  grad2.addColorStop(1, hexToRGBA(color, 0));
  ctx.fillStyle = grad2;

  ctx.beginPath();
  ctx.moveTo(leftTemple.x, leftTemple.y);
  ctx.quadraticCurveTo(foreheadTop.x, hairEndY, rightTemple.x, rightTemple.y);
  ctx.lineTo(foreheadTop.x + faceWidth * 0.5, hairStartY);
  ctx.quadraticCurveTo(foreheadTop.x, hairStartY + 5, leftTemple.x, leftTemple.y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Sunglasses (FIXED — renders actual product image) ────────────────────────
// Loads the product's overlayImage and draws it spanning both eyes,
// rotated to match head tilt. Falls back to stylised canvas shape if no image.

// Module-level image cache so we don't reload every frame
const _imgCache: Map<string, HTMLImageElement | null> = new Map();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function preloadOverlayImage(src: string | null) {
  if (!src || _imgCache.has(src)) return;
  _imgCache.set(src, null); // mark as loading
  try {
    const img = await loadImage(src);
    _imgCache.set(src, img);
  } catch {
    _imgCache.delete(src); // allow retry
  }
}

export function renderSunglasses(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string = "#111111",
  intensity: number = 0.9,
  overlayImageSrc?: string | null
) {
  // Key landmark points
  const leftEyeOuter  = getCanvasCoords(landmarks[33],  width, height);
  const leftEyeInner  = getCanvasCoords(landmarks[133], width, height);
  const rightEyeInner = getCanvasCoords(landmarks[362], width, height);
  const rightEyeOuter = getCanvasCoords(landmarks[263], width, height);
  const noseBridge    = getCanvasCoords(landmarks[168], width, height);

  const leftEyeCenter = {
    x: (leftEyeOuter.x  + leftEyeInner.x)  / 2,
    y: (leftEyeOuter.y  + leftEyeInner.y)  / 2,
  };
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeOuter.y + rightEyeInner.y) / 2,
  };

  // Overall glasses width = outer-left to outer-right, with padding
  const glassesWidth  = getDistance(leftEyeOuter, rightEyeOuter) * 1.45;
  // Height roughly 60% of the width (typical glasses aspect ratio)
  const glassesHeight = glassesWidth * 0.42;
  // Centre point between both eyes
  const centerX = (leftEyeCenter.x  + rightEyeCenter.x) / 2;
  const centerY = (leftEyeCenter.y  + rightEyeCenter.y) / 2;
  // Head tilt angle
  const angle   = getAngle(leftEyeCenter, rightEyeCenter);

  // ── Try to render the real product image ──────────────────────────────────
  if (overlayImageSrc) {
    const cached = _imgCache.get(overlayImageSrc);
    if (cached) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.globalAlpha = intensity;
      // Draw centred on the eye midpoint
      ctx.drawImage(
        cached,
        -glassesWidth / 2,
        -glassesHeight / 2,
        glassesWidth,
        glassesHeight
      );
      ctx.globalAlpha = 1;
      ctx.restore();
      return; // done — real image rendered
    }
    // If not cached yet, kick off a load (will render from cache next frame)
    if (!_imgCache.has(overlayImageSrc)) {
      preloadOverlayImage(overlayImageSrc);
    }
  }

  // ── Fallback: stylised canvas glasses (better than before) ────────────────
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = "source-over";

  const lensW = glassesWidth * 0.40;
  const lensH = glassesHeight * 0.80;
  const lensOffsetX = glassesWidth * 0.24;

  // Lens fill (dark, semi-transparent)
  ctx.fillStyle   = hexToRGBA(color, intensity * 0.85);
  ctx.strokeStyle = hexToRGBA("#1a1a1a", 0.95);
  ctx.lineWidth   = Math.max(2, glassesWidth * 0.012);

  // Left lens (rounded rect)
  for (const ox of [-lensOffsetX, lensOffsetX]) {
    ctx.beginPath();
    const r = lensH * 0.25;
    const lx = ox - lensW / 2, ly = -lensH / 2;
    ctx.moveTo(lx + r, ly);
    ctx.arcTo(lx + lensW, ly,         lx + lensW, ly + lensH, r);
    ctx.arcTo(lx + lensW, ly + lensH, lx,         ly + lensH, r);
    ctx.arcTo(lx,         ly + lensH, lx,         ly,         r);
    ctx.arcTo(lx,         ly,         lx + lensW, ly,         r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Bridge
  const bridgeStartX = -lensOffsetX + lensW / 2;
  const bridgeEndX   =  lensOffsetX - lensW / 2;
  ctx.beginPath();
  ctx.moveTo(bridgeStartX, 0);
  ctx.quadraticCurveTo(0, -lensH * 0.15, bridgeEndX, 0);
  ctx.stroke();

  // Arms (temples)
  ctx.beginPath();
  ctx.moveTo(-lensOffsetX - lensW / 2, 0);
  ctx.lineTo(-glassesWidth / 2, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(lensOffsetX + lensW / 2, 0);
  ctx.lineTo(glassesWidth / 2, 0);
  ctx.stroke();

  ctx.restore();
}

// ─── Nails ────────────────────────────────────────────────────────────────────
export function renderNails(
  ctx: CanvasRenderingContext2D,
  handLandmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.8
) {
  const FINGER_TIPS = [4, 8, 12, 16, 20];
  const FINGER_DIPS = [3, 7, 11, 15, 19];

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = hexToRGBA(color, intensity);

  FINGER_TIPS.forEach((tipIdx, i) => {
    const dipIdx = FINGER_DIPS[i];
    const tip = getCanvasCoords(handLandmarks[tipIdx], width, height);
    const dip = getCanvasCoords(handLandmarks[dipIdx], width, height);

    const dist      = getDistance(tip, dip);
    const nailRadius = Math.max(dist * 0.3, 2);

    ctx.beginPath();
    ctx.ellipse(
      tip.x, tip.y,
      nailRadius, nailRadius * 1.2,
      getAngle(dip, tip),
      0, 2 * Math.PI
    );
    ctx.fill();
  });

  ctx.restore();
}

// ─── Ring (FIXED) ─────────────────────────────────────────────────────────────
// Draws on the ring finger (landmark 14 = PIP, 15 = DIP).
// Renders with a gold metallic gradient instead of a flat stroke.
export function renderRing(
  ctx: CanvasRenderingContext2D,
  handLandmarks: any[],
  width: number,
  height: number,
  color: string = "#FFD700",
  overlayImageSrc?: string | null
) {
  // Ring finger: MCP=13, PIP=14 — place ring at PIP joint
  const pip = getCanvasCoords(handLandmarks[14], width, height);
  const mcp = getCanvasCoords(handLandmarks[13], width, height);
  const dip = getCanvasCoords(handLandmarks[15], width, height);

  const segLen  = getDistance(pip, dip);
  const radiusX = Math.max(segLen * 0.55, 8);
  const radiusY = radiusX * 0.35;
  const angle   = getAngle(mcp, pip);

  // Centre the ring between PIP and DIP
  const cx = (pip.x + dip.x) / 2;
  const cy = (pip.y + dip.y) / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  // ── If real product image is available ───────────────────────────────────
  if (overlayImageSrc) {
    const cached = _imgCache.get(overlayImageSrc);
    if (cached) {
      const imgSize = radiusX * 2.5;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(cached, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    if (!_imgCache.has(overlayImageSrc)) preloadOverlayImage(overlayImageSrc);
  }

  // ── Fallback: metallic gold ring ─────────────────────────────────────────
  const grad = ctx.createLinearGradient(-radiusX, 0, radiusX, 0);
  grad.addColorStop(0,    "#b8860b");
  grad.addColorStop(0.3,  color);
  grad.addColorStop(0.5,  "#fffacd");
  grad.addColorStop(0.7,  color);
  grad.addColorStop(1,    "#b8860b");

  // Band
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.lineWidth   = Math.max(4, radiusY * 0.7);
  ctx.strokeStyle = grad;
  ctx.stroke();

  // Gem
  const gemR = Math.max(3, radiusY * 0.6);
  const gemGrad = ctx.createRadialGradient(-gemR * 0.3, -gemR * 0.3, 0, 0, 0, gemR);
  gemGrad.addColorStop(0, "#ffffff");
  gemGrad.addColorStop(0.4, "#a8d8ea");
  gemGrad.addColorStop(1, "#4a90d9");
  ctx.beginPath();
  ctx.arc(0, -radiusY, gemR, 0, Math.PI * 2);
  ctx.fillStyle = gemGrad;
  ctx.fill();

  ctx.restore();
}

// ─── Bracelet (FIXED) ─────────────────────────────────────────────────────────
// Positions correctly at wrist (landmark 0), perpendicular to the hand axis.
export function renderBracelet(
  ctx: CanvasRenderingContext2D,
  handLandmarks: any[],
  width: number,
  height: number,
  color: string = "#C0C0C0",
  overlayImageSrc?: string | null
) {
  const wrist     = getCanvasCoords(handLandmarks[0],  width, height);
  const mcpMiddle = getCanvasCoords(handLandmarks[9],  width, height);

  const handLength = getDistance(wrist, mcpMiddle);
  const radiusX    = Math.max(handLength * 0.45, 18);
  const radiusY    = radiusX * 0.32;
  const angle      = getAngle(wrist, mcpMiddle);

  ctx.save();
  ctx.translate(wrist.x, wrist.y);
  ctx.rotate(angle + Math.PI / 2);

  // ── Real product image ────────────────────────────────────────────────────
  if (overlayImageSrc) {
    const cached = _imgCache.get(overlayImageSrc);
    if (cached) {
      const imgSize = radiusX * 2.8;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(cached, -imgSize / 2, -imgSize * 0.3, imgSize, imgSize * 0.6);
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    if (!_imgCache.has(overlayImageSrc)) preloadOverlayImage(overlayImageSrc);
  }

  // ── Fallback: metallic bracelet ───────────────────────────────────────────
  const isGold   = color.toLowerCase().includes("d7") || color === "#FFD700";
  const highlight = isGold ? "#fffacd" : "#ffffff";
  const shadow    = isGold ? "#b8860b" : "#808080";

  const grad = ctx.createLinearGradient(-radiusX, 0, radiusX, 0);
  grad.addColorStop(0,   shadow);
  grad.addColorStop(0.3, color);
  grad.addColorStop(0.5, highlight);
  grad.addColorStop(0.7, color);
  grad.addColorStop(1,   shadow);

  // Main band
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.lineWidth   = Math.max(5, radiusY * 0.9);
  ctx.strokeStyle = grad;
  ctx.stroke();

  // Inner highlight line
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX * 0.82, radiusY * 0.7, 0, 0, Math.PI * 2);
  ctx.lineWidth   = 1;
  ctx.strokeStyle = hexToRGBA(highlight, 0.5);
  ctx.stroke();

  ctx.restore();
}

// ─── Necklace (FIXED) ─────────────────────────────────────────────────────────
// Was drawing off-screen. Now calculates necklace Y relative to chin + neck area
// and limits it to stay within the canvas.
export function renderNecklace(
  ctx: CanvasRenderingContext2D,
  faceLandmarks: any[],
  width: number,
  height: number,
  color: string = "#FFFFFF",
  overlayImageSrc?: string | null
) {
  const chin      = getCanvasCoords(faceLandmarks[152], width, height);
  const leftJaw   = getCanvasCoords(faceLandmarks[132], width, height);
  const rightJaw  = getCanvasCoords(faceLandmarks[361], width, height);
  const leftEar   = getCanvasCoords(faceLandmarks[234], width, height);
  const rightEar  = getCanvasCoords(faceLandmarks[454], width, height);

  const faceWidth = getDistance(leftEar, rightEar);

  // Neck centre — slightly below chin
  const neckCX = (leftJaw.x + rightJaw.x) / 2;
  const neckCY = chin.y + faceWidth * 0.18;   // was 0.4 → too far below

  // Necklace arc radius — fits within the neck area
  const arcRadius = faceWidth * 0.38;          // tighter than before

  // Clamp so necklace stays on screen
  const clampedCY = Math.min(neckCY, height - arcRadius * 0.3);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  const isPearl  = color === "#FFFFFF" || color.toLowerCase() === "pearl";
  const pearlCol = isPearl ? "#f8f0e3" : color;

  // Chain / string arc
  ctx.beginPath();
  ctx.arc(neckCX, clampedCY, arcRadius, Math.PI * 0.15, Math.PI * 0.85, false);
  ctx.lineWidth   = isPearl ? 1 : 3;
  ctx.strokeStyle = isPearl ? "#d4c5a9" : color;
  ctx.stroke();

  // Pearls / gems along the arc
  const startAngle = Math.PI * 0.15;
  const endAngle   = Math.PI * 0.85;
  const steps      = isPearl ? 14 : 10;

  for (let i = 0; i <= steps; i++) {
    const t     = i / steps;
    const theta = startAngle + t * (endAngle - startAngle);
    const px    = neckCX  + arcRadius * Math.cos(theta);
    const py    = clampedCY + arcRadius * Math.sin(theta);

    const gemR  = isPearl
      ? Math.max(4, faceWidth * 0.022)
      : Math.max(3, faceWidth * 0.018);

    if (isPearl) {
      // Pearl gradient
      const pGrad = ctx.createRadialGradient(
        px - gemR * 0.3, py - gemR * 0.3, 0,
        px, py, gemR
      );
      pGrad.addColorStop(0,   "#ffffff");
      pGrad.addColorStop(0.5, pearlCol);
      pGrad.addColorStop(1,   "#c8b89a");
      ctx.beginPath();
      ctx.arc(px, py, gemR, 0, Math.PI * 2);
      ctx.fillStyle = pGrad;
      ctx.fill();
    } else {
      // Coloured gem
      ctx.beginPath();
      ctx.arc(px, py, gemR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth   = 1;
      ctx.strokeStyle = "#ffffff44";
      ctx.stroke();
    }
  }

  // Pendant at the bottom centre
  const pendantAngle = Math.PI * 0.5;
  const pendantX     = neckCX  + arcRadius * Math.cos(pendantAngle);
  const pendantY     = clampedCY + arcRadius * Math.sin(pendantAngle);
  const pendantR     = Math.max(6, faceWidth * 0.032);

  const pGrad = ctx.createRadialGradient(
    pendantX - pendantR * 0.3, pendantY - pendantR * 0.3, 0,
    pendantX, pendantY, pendantR
  );
  pGrad.addColorStop(0,   "#ffffff");
  pGrad.addColorStop(0.4, isPearl ? pearlCol : color);
  pGrad.addColorStop(1,   isPearl ? "#c8b89a" : "#00000055");

  ctx.beginPath();
  ctx.arc(pendantX, pendantY, pendantR, 0, Math.PI * 2);
  ctx.fillStyle = pGrad;
  ctx.fill();

  ctx.restore();
}