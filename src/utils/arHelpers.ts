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

export function getCanvasCoords(landmark: { x: number; y: number }, width: number, height: number, mirror: boolean = true) {
  const x = mirror ? (1 - landmark.x) * width : landmark.x * width;
  return { x, y: landmark.y * height };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// AR Drawing Functions
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

  // Lower Lip
  ctx.beginPath();
  LIP_LOWER.forEach((idx, i) => {
    const p = getCanvasCoords(landmarks[idx], width, height);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();

  // Upper Lip
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

export function renderHairColor(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string,
  intensity: number = 0.5
) {
  const HAIRLINE = [103, 67, 109, 10, 338, 297, 332]; // roughly top of forehead
  
  if (HAIRLINE.length === 0) return;
  
  const left = getCanvasCoords(landmarks[103], width, height);
  const right = getCanvasCoords(landmarks[332], width, height);
  const top = getCanvasCoords(landmarks[10], width, height);
  
  const hairTopY = Math.max(0, top.y - (right.x - left.x) * 0.5);
  
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  
  const grad = ctx.createLinearGradient(0, top.y, 0, hairTopY);
  grad.addColorStop(0, hexToRGBA(color, 0));
  grad.addColorStop(1, hexToRGBA(color, intensity));
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.bezierCurveTo(left.x, hairTopY, right.x, hairTopY, right.x, right.y);
  ctx.lineTo(left.x, left.y);
  ctx.fill();
  
  ctx.restore();
}

export function renderSunglasses(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  color: string = "#111111",
  intensity: number = 0.9
) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = hexToRGBA(color, intensity);
  ctx.strokeStyle = hexToRGBA("#000000", 0.9);
  ctx.lineWidth = 3;

  // Approximate centers for eyes using bounding landmarks
  const leftEyeOuter = getCanvasCoords(landmarks[33], width, height);
  const leftEyeInner = getCanvasCoords(landmarks[133], width, height);
  
  const rightEyeInner = getCanvasCoords(landmarks[362], width, height);
  const rightEyeOuter = getCanvasCoords(landmarks[263], width, height);
  
  const noseBridge = getCanvasCoords(landmarks[168], width, height);

  const eyeWidth = getDistance(leftEyeOuter, leftEyeInner) * 1.5;
  const radius = eyeWidth / 2;

  const leftEyeCenter = {
    x: (leftEyeOuter.x + leftEyeInner.x) / 2,
    y: (leftEyeOuter.y + leftEyeInner.y) / 2
  };
  
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeOuter.y + rightEyeInner.y) / 2
  };

  // Draw Left Lens
  ctx.beginPath();
  ctx.arc(leftEyeCenter.x, leftEyeCenter.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw Right Lens
  ctx.beginPath();
  ctx.arc(rightEyeCenter.x, rightEyeCenter.y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Draw Bridge
  ctx.beginPath();
  ctx.moveTo(leftEyeCenter.x + radius, leftEyeCenter.y);
  ctx.quadraticCurveTo(noseBridge.x, noseBridge.y - radius * 0.5, rightEyeCenter.x - radius, rightEyeCenter.y);
  ctx.stroke();

  ctx.restore();
}

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
    
    // Estimate nail size based on distance between dip and tip
    const dist = getDistance(tip, dip);
    const nailRadius = Math.max(dist * 0.3, 2);

    ctx.beginPath();
    ctx.ellipse(tip.x, tip.y, nailRadius, nailRadius * 1.2, getAngle(dip, tip), 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.restore();
}

export function renderRing(
  ctx: CanvasRenderingContext2D,
  handLandmarks: any[],
  width: number,
  height: number,
  color: string = "#FFD700" // Gold
) {
  // Draw ring on ring finger (proximal phalanx)
  // Landmarks 13 (MCP) and 14 (PIP) for ring finger
  const mcp = getCanvasCoords(handLandmarks[13], width, height);
  const pip = getCanvasCoords(handLandmarks[14], width, height);

  const center = { x: (mcp.x + pip.x) / 2, y: (mcp.y + pip.y) / 2 };
  const dist = getDistance(mcp, pip);
  const radius = Math.max(dist * 0.4, 5);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  
  // Ring band
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, radius, radius * 0.6, getAngle(mcp, pip) + Math.PI/2, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Highlight/Gem
  ctx.beginPath();
  ctx.arc(center.x, center.y - radius * 0.4, 3, 0, 2 * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.restore();
}

export function renderBracelet(
  ctx: CanvasRenderingContext2D,
  handLandmarks: any[],
  width: number,
  height: number,
  color: string = "#C0C0C0" // Silver
) {
  // Wrist is landmark 0
  const wrist = getCanvasCoords(handLandmarks[0], width, height);
  const mcpMiddle = getCanvasCoords(handLandmarks[9], width, height);
  
  const dist = getDistance(wrist, mcpMiddle);
  const radius = Math.max(dist * 0.5, 15);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.ellipse(wrist.x, wrist.y + radius * 0.2, radius * 1.2, radius * 0.4, getAngle(wrist, mcpMiddle), 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(wrist.x, wrist.y + radius * 0.4, radius * 1.2, radius * 0.4, getAngle(wrist, mcpMiddle), 0, 2 * Math.PI);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.restore();
}

export function renderNecklace(
  ctx: CanvasRenderingContext2D,
  faceLandmarks: any[],
  width: number,
  height: number,
  color: string = "#FFFFFF" // Pearl
) {
  // Chin is 152
  const chin = getCanvasCoords(faceLandmarks[152], width, height);
  const leftJaw = getCanvasCoords(faceLandmarks[132], width, height);
  const rightJaw = getCanvasCoords(faceLandmarks[361], width, height);
  
  const faceWidth = getDistance(leftJaw, rightJaw);
  
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  
  const necklaceY = chin.y + faceWidth * 0.4;
  const radius = faceWidth * 0.6;
  
  ctx.beginPath();
  ctx.arc(chin.x, necklaceY, radius, Math.PI * 0.2, Math.PI * 0.8, false);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();
  
  // Pearls
  for(let angle = Math.PI * 0.25; angle <= Math.PI * 0.75; angle += 0.1) {
    const px = chin.x + radius * Math.cos(angle);
    const py = necklaceY + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
