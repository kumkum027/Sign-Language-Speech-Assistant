/**
 * Pure JavaScript ISL Hand Gesture Classifier
 * Operates on normalized 21 MediaPipe hand landmarks
 * 
 * MediaPipe Landmark Indices:
 * 0: WRIST
 * 1-4: THUMB (CMC, MCP, IP, TIP)
 * 5-8: INDEX (MCP, PIP, DIP, TIP)
 * 9-12: MIDDLE (MCP, PIP, DIP, TIP)
 * 13-16: RING (MCP, PIP, DIP, TIP)
 * 17-20: PINKY (MCP, PIP, DIP, TIP)
 */

export const LANDMARK_NAMES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// Euclidean distance in 3D
export function calcDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// 2D distance on image plane (x, y)
export function calcDistance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Determine if a non-thumb finger is extended
export function isFingerExtended(landmarks, mcpIdx, pipIdx, tipIdx, handScale) {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];

  const distTipWrist = calcDistance(tip, wrist);
  const distPipWrist = calcDistance(pip, wrist);
  const distTipMcp = calcDistance(tip, mcp);

  // Finger is extended if tip is significantly farther from wrist than PIP is
  return distTipWrist > distPipWrist && distTipMcp > 0.65 * handScale;
}

// Determine if a non-thumb finger is curled into palm
export function isFingerCurled(landmarks, mcpIdx, pipIdx, tipIdx, handScale) {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const tip = landmarks[tipIdx];

  const distTipWrist = calcDistance(tip, wrist);
  const distMcpWrist = calcDistance(mcp, wrist);
  const distTipMcp = calcDistance(tip, mcp);

  // Tip is close to wrist/MCP, shorter than full extension
  return distTipWrist < distMcpWrist * 1.15 || distTipMcp < 0.55 * handScale;
}

/**
 * Classifies a single hand's 21 landmarks into recognized ISL gestures
 * @param {Array<{x: number, y: number, z: number}>} landmarks 
 * @returns {{ gesture: string, confidence: number, label: string, isSign: boolean }}
 */
export function classifyHandGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: "NONE", confidence: 0, label: "No hand detected", isSign: false };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  // Scale of hand: distance between wrist and middle MCP
  const handScale = Math.max(0.01, calcDistance(wrist, middleMcp));

  // Finger extension state
  const indexExtended = isFingerExtended(landmarks, 5, 6, 8, handScale);
  const middleExtended = isFingerExtended(landmarks, 9, 10, 12, handScale);
  const ringExtended = isFingerExtended(landmarks, 13, 14, 16, handScale);
  const pinkyExtended = isFingerExtended(landmarks, 17, 18, 20, handScale);

  const indexCurled = isFingerCurled(landmarks, 5, 6, 8, handScale);
  const middleCurled = isFingerCurled(landmarks, 9, 10, 12, handScale);
  const ringCurled = isFingerCurled(landmarks, 13, 14, 16, handScale);
  const pinkyCurled = isFingerCurled(landmarks, 17, 18, 20, handScale);

  // Distinct thumb states
  // Thumbs up requires thumb tip to be clearly extended upwards above MCP and index MCP
  const thumbPointingUp =
    thumbTip.y < indexMcp.y &&
    thumbTip.y < thumbMcp.y - 0.40 * handScale &&
    calcDistance(thumbTip, wrist) > 0.70 * handScale;

  // Thumbs down requires thumb tip to be pointing downwards towards or below wrist
  const thumbPointingDown =
    thumbTip.y > thumbMcp.y + 0.35 * handScale &&
    thumbTip.y > wrist.y - 0.25 * handScale;

  const thumbExtendedOut = calcDistance(thumbTip, indexMcp) > 0.65 * handScale;
  const thumbTouchingIndex = calcDistance(thumbTip, indexTip) < 0.32 * handScale;
  const thumbCurled = !thumbPointingUp && !thumbPointingDown && !thumbExtendedOut;

  // 1. QUESTION / DOUBT (Index finger extended, other fingers curled)
  if (indexExtended && middleCurled && ringCurled && pinkyCurled && !thumbPointingUp) {
    const confidence = Math.min(0.98, 0.88 + (calcDistance(indexTip, wrist) / handScale) * 0.05);
    return {
      gesture: "QUESTION",
      confidence: Math.round(confidence * 100) / 100,
      label: "Question / Doubt",
      isSign: true,
    };
  }

  // 2. YES / AGREE (Thumbs Up: Thumb pointing up, 4 fingers curled)
  if (thumbPointingUp && indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return {
      gesture: "YES",
      confidence: 0.95,
      label: "Yes / Agree",
      isSign: true,
    };
  }

  // 3. NO / DISAGREE (Thumbs Down: Thumb pointing down, 4 fingers curled)
  if (thumbPointingDown && indexCurled && middleCurled && ringCurled && pinkyCurled) {
    return {
      gesture: "NO",
      confidence: 0.94,
      label: "No / Disagree",
      isSign: true,
    };
  }

  // 4. PEACE / VICTORY / TWO (Index and Middle extended in V-shape, others curled)
  if (indexExtended && middleExtended && ringCurled && pinkyCurled && !thumbPointingUp) {
    return {
      gesture: "PEACE",
      confidence: 0.96,
      label: "Peace / Victory",
      isSign: true,
    };
  }

  // 5. OK / UNDERSTOOD (Thumb tip touching Index tip, other 3 extended)
  if (thumbTouchingIndex && middleExtended && ringExtended && pinkyExtended) {
    return {
      gesture: "OK",
      confidence: 0.95,
      label: "Understood / OK",
      isSign: true,
    };
  }

  // 6. HELLO / OPEN PALM (All 5 fingers extended upwards)
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && (thumbExtendedOut || thumbTip.y < indexMcp.y)) {
    // Ensure hand is facing roughly upright
    if (wrist.y > middleMcp.y - 0.1 * handScale) {
      return {
        gesture: "HELLO",
        confidence: 0.97,
        label: "Hello / Greeting",
        isSign: true,
      };
    }
  }

  // 7. IMPORTANT / CLOSED FIST (All fingers curled tightly)
  if (indexCurled && middleCurled && ringCurled && pinkyCurled && thumbCurled && !thumbPointingUp && !thumbPointingDown) {
    return {
      gesture: "IMPORTANT",
      confidence: 0.95,
      label: "Important / Note This",
      isSign: true,
    };
  }

  // 8. HELP / ASSIST (Flat horizontal hand with palm cupped)
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    const tipSpread = Math.abs(indexTip.y - pinkyTip.y);
    if (tipSpread < 0.25 * handScale) {
      return {
        gesture: "HELP",
        confidence: 0.90,
        label: "Help / Assist",
        isSign: true,
      };
    }
  }

  return {
    gesture: "UNKNOWN",
    confidence: 0.4,
    label: "Hand detected (No sign match)",
    isSign: false,
  };
}
