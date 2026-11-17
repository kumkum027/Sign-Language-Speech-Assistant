/**
 * Temporal Gesture Stabilizer and Debouncer
 * Prevents jitter, flickering, and duplicate transmissions during real-time 30 FPS video tracking.
 */

export class GestureStabilizer {
  constructor(options = {}) {
    this.bufferSize = options.bufferSize || 10; // Number of frames to analyze
    this.agreementThreshold = options.agreementThreshold || 0.7; // 70% frame consensus required
    this.cooldownMs = options.cooldownMs || 1800; // Cooldown before same gesture can repeat
    this.minConfidence = options.minConfidence || 0.85;

    this.frameBuffer = [];
    this.lastEmittedGesture = null;
    this.lastEmittedTime = 0;
  }

  /**
   * Process a new frame classification
   * @param {{ gesture: string, confidence: number, label: string, isSign: boolean }} result 
   * @returns {{ shouldEmit: boolean, gesture: string, confidence: number, label: string } | null}
   */
  process(result) {
    const now = Date.now();

    // Ignore frames with no recognized sign
    if (!result || !result.isSign || result.confidence < this.minConfidence) {
      this.frameBuffer.push({ gesture: "NONE", timestamp: now });
      if (this.frameBuffer.length > this.bufferSize) {
        this.frameBuffer.shift();
      }
      return null;
    }

    this.frameBuffer.push({
      gesture: result.gesture,
      confidence: result.confidence,
      label: result.label,
      timestamp: now,
    });

    if (this.frameBuffer.length > this.bufferSize) {
      this.frameBuffer.shift();
    }

    // Tally votes in the buffer
    const counts = {};
    let maxCount = 0;
    let dominantGesture = null;
    let sumConfidence = 0;

    for (const frame of this.frameBuffer) {
      if (frame.gesture === "NONE") continue;
      counts[frame.gesture] = (counts[frame.gesture] || 0) + 1;
      if (counts[frame.gesture] > maxCount) {
        maxCount = counts[frame.gesture];
        dominantGesture = frame.gesture;
      }
    }

    if (!dominantGesture) return null;

    const consensusRatio = maxCount / this.bufferSize;

    // Check if consensus meets threshold
    if (consensusRatio >= this.agreementThreshold) {
      // Check cooldown if it's the exact same gesture
      const isCooldownActive =
        this.lastEmittedGesture === dominantGesture &&
        now - this.lastEmittedTime < this.cooldownMs;

      if (!isCooldownActive) {
        this.lastEmittedGesture = dominantGesture;
        this.lastEmittedTime = now;

        // Clear buffer after trigger to avoid immediate re-trigger
        this.frameBuffer = [];

        return {
          shouldEmit: true,
          gesture: dominantGesture,
          confidence: result.confidence,
          label: result.label,
          timestamp: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  reset() {
    this.frameBuffer = [];
    this.lastEmittedGesture = null;
    this.lastEmittedTime = 0;
  }
}
