/**
 * Hand Landmark Skeleton Visualizer
 * Draws 21 MediaPipe landmarks and 21 connecting bones on an HTML5 Canvas.
 */

export const HAND_CONNECTIONS = [
  // Wrist & Palm base
  [0, 1],
  [0, 5],
  [0, 17],
  [5, 9],
  [9, 13],
  [13, 17],

  // Thumb
  [1, 2],
  [2, 3],
  [3, 4],

  // Index finger
  [5, 6],
  [6, 7],
  [7, 8],

  // Middle finger
  [9, 10],
  [10, 11],
  [11, 12],

  // Ring finger
  [13, 14],
  [14, 15],
  [15, 16],

  // Pinky finger
  [17, 18],
  [18, 19],
  [19, 20],
];

export const FINGERTIP_INDICES = new Set([4, 8, 12, 16, 20]);

/**
 * Draw hand landmarks and connecting skeleton bones
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array<{x: number, y: number, z?: number}>} landmarks 
 * @param {number} width 
 * @param {number} height 
 * @param {object} options 
 */
export function drawHandLandmarks(ctx, landmarks, width, height, options = {}) {
  if (!ctx || !landmarks || landmarks.length < 21) return;

  const boneColor = options.boneColor || "#176B60"; // Auralis primary accent
  const jointColor = options.jointColor || "#B7D9CF"; // Auralis secondary accent
  const tipColor = options.tipColor || "#2FE4BD"; // Auralis bright highlight
  const lineWidth = options.lineWidth || 2.5;

  ctx.save();

  // 1. Draw Bones (Connections)
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (!start || !end) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  // 2. Draw Joints and Fingertips
  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    const x = pt.x * width;
    const y = pt.y * height;
    const isTip = FINGERTIP_INDICES.has(i);

    ctx.beginPath();
    const radius = isTip ? 5 : 3.5;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    if (isTip) {
      ctx.fillStyle = tipColor;
      ctx.shadowColor = tipColor;
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = jointColor;
      ctx.shadowBlur = 0;
    }

    ctx.fill();

    // Subtle outline
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}
