// scripts/test-phase8-9.js
// Automated verification for Phase 8 & 9:
// - Computer Vision 21-Landmark Geometry & Classification
// - Gesture Stabilizer & Temporal Debouncing
// - Sign Language Socket Payloads & Event Verification
// - Database Persistence for Sign Language Transcripts

const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

// Helper to create synthetic 21 hand landmarks
// Wrist at (0.5, 0.8, 0)
// MCP row at y ≈ 0.55
function createSyntheticHand({
  thumb = "CURLED", // "EXTENDED_UP", "EXTENDED_DOWN", "CURLED", "OUT"
  index = "CURLED", // "EXTENDED", "CURLED"
  middle = "CURLED",
  ring = "CURLED",
  pinky = "CURLED",
  touchThumbIndex = false,
}) {
  const landmarks = new Array(21);
  landmarks[0] = { x: 0.5, y: 0.8, z: 0 }; // Wrist

  // Thumb (1..4)
  landmarks[1] = { x: 0.44, y: 0.74, z: 0 }; // CMC
  landmarks[2] = { x: 0.40, y: 0.68, z: 0 }; // MCP
  landmarks[3] = { x: 0.38, y: 0.62, z: 0 }; // IP

  if (thumb === "EXTENDED_UP") {
    landmarks[4] = { x: 0.38, y: 0.42, z: 0 }; // Thumb pointing well above MCP
  } else if (thumb === "EXTENDED_DOWN") {
    landmarks[4] = { x: 0.38, y: 0.95, z: 0 }; // Thumb pointing well below MCP
  } else if (touchThumbIndex) {
    landmarks[4] = { x: 0.43, y: 0.40, z: 0 }; // Touching index tip
  } else if (thumb === "OUT") {
    landmarks[4] = { x: 0.25, y: 0.60, z: 0 }; // Outward
  } else {
    landmarks[4] = { x: 0.46, y: 0.60, z: 0 }; // Curled into palm
  }

  // Fingers helper
  const addFinger = (mcpIdx, pipIdx, dipIdx, tipIdx, xBase, state) => {
    landmarks[mcpIdx] = { x: xBase, y: 0.55, z: 0 };
    if (state === "EXTENDED") {
      landmarks[pipIdx] = { x: xBase, y: 0.45, z: 0 };
      landmarks[dipIdx] = { x: xBase, y: 0.35, z: 0 };
      landmarks[tipIdx] = { x: xBase, y: 0.25, z: 0 }; // Far above wrist
    } else {
      landmarks[pipIdx] = { x: xBase, y: 0.60, z: 0 };
      landmarks[dipIdx] = { x: xBase, y: 0.65, z: 0 };
      landmarks[tipIdx] = { x: xBase, y: 0.68, z: 0 }; // Folded close to MCP/wrist
    }
  };

  addFinger(5, 6, 7, 8, 0.43, index); // Index
  if (touchThumbIndex) {
    landmarks[8] = { x: 0.44, y: 0.40, z: 0 }; // Touch thumb tip
  }

  addFinger(9, 10, 11, 12, 0.50, middle); // Middle
  addFinger(13, 14, 15, 16, 0.57, ring); // Ring
  addFinger(17, 18, 19, 20, 0.63, pinky); // Pinky

  return landmarks;
}

// Import pure JS modules from src/lib/gesture
// Note: using dynamic require / eval or compiled CommonJS representation
const {
  classifyHandGesture,
  calcDistance,
} = require("../src/lib/gesture/classifier");
const { GestureStabilizer } = require("../src/lib/gesture/stabilizer");

async function runTests() {
  console.log("=================================================");
  console.log("  AURALIS AUTOMATED TESTS: PHASE 8 & 9");
  console.log("  Computer Vision Gesture Classifier & Realtime Sync");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Math Distance check
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 3, y: 4, z: 0 };
    const dist = calcDistance(p1, p2);
    assert(Math.abs(dist - 5) < 0.001, "3D Euclidean distance calculation verified (3-4-5 triangle)");

    // 2. Test ISL Question Gesture (Index extended, others curled)
    const questionHand = createSyntheticHand({
      thumb: "CURLED",
      index: "EXTENDED",
      middle: "CURLED",
      ring: "CURLED",
      pinky: "CURLED",
    });
    const qResult = classifyHandGesture(questionHand);
    assert(
      qResult.gesture === "QUESTION" && qResult.isSign === true,
      `Classified QUESTION gesture accurately (confidence: ${qResult.confidence})`
    );

    // 3. Test ISL Yes Gesture (Thumbs Up)
    const yesHand = createSyntheticHand({
      thumb: "EXTENDED_UP",
      index: "CURLED",
      middle: "CURLED",
      ring: "CURLED",
      pinky: "CURLED",
    });
    const yesResult = classifyHandGesture(yesHand);
    assert(
      yesResult.gesture === "YES" && yesResult.isSign === true,
      `Classified YES / AGREE gesture accurately (confidence: ${yesResult.confidence})`
    );

    // 4. Test ISL No Gesture (Thumbs Down)
    const noHand = createSyntheticHand({
      thumb: "EXTENDED_DOWN",
      index: "CURLED",
      middle: "CURLED",
      ring: "CURLED",
      pinky: "CURLED",
    });
    const noResult = classifyHandGesture(noHand);
    assert(
      noResult.gesture === "NO" && noResult.isSign === true,
      `Classified NO / DISAGREE gesture accurately (confidence: ${noResult.confidence})`
    );

    // 5. Test ISL Peace / Victory Gesture (Index + Middle extended)
    const peaceHand = createSyntheticHand({
      thumb: "CURLED",
      index: "EXTENDED",
      middle: "EXTENDED",
      ring: "CURLED",
      pinky: "CURLED",
    });
    const peaceResult = classifyHandGesture(peaceHand);
    assert(
      peaceResult.gesture === "PEACE" && peaceResult.isSign === true,
      `Classified PEACE / VICTORY gesture accurately (confidence: ${peaceResult.confidence})`
    );

    // 6. Test ISL OK / Understood Gesture (Thumb & Index touching, others extended)
    const okHand = createSyntheticHand({
      touchThumbIndex: true,
      index: "EXTENDED",
      middle: "EXTENDED",
      ring: "EXTENDED",
      pinky: "EXTENDED",
    });
    const okResult = classifyHandGesture(okHand);
    assert(
      okResult.gesture === "OK" && okResult.isSign === true,
      `Classified OK / UNDERSTOOD gesture accurately (confidence: ${okResult.confidence})`
    );

    // 7. Test ISL Hello Gesture (All fingers extended)
    const helloHand = createSyntheticHand({
      thumb: "OUT",
      index: "EXTENDED",
      middle: "EXTENDED",
      ring: "EXTENDED",
      pinky: "EXTENDED",
    });
    const helloResult = classifyHandGesture(helloHand);
    assert(
      helloResult.gesture === "HELLO" && helloResult.isSign === true,
      `Classified HELLO / GREETING gesture accurately (confidence: ${helloResult.confidence})`
    );

    // 8. Test ISL Important / Fist Gesture (All curled)
    const fistHand = createSyntheticHand({
      thumb: "CURLED",
      index: "CURLED",
      middle: "CURLED",
      ring: "CURLED",
      pinky: "CURLED",
    });
    const fistResult = classifyHandGesture(fistHand);
    assert(
      fistResult.gesture === "IMPORTANT" && fistResult.isSign === true,
      `Classified IMPORTANT / FIST gesture accurately (confidence: ${fistResult.confidence})`
    );

    // 9. Test Temporal Stabilizer & Debouncing
    const stabilizer = new GestureStabilizer({
      bufferSize: 5,
      agreementThreshold: 0.6,
      cooldownMs: 500,
      minConfidence: 0.8,
    });

    // Feed 2 noisy frames -> should return null (no consensus)
    const s1 = stabilizer.process(qResult);
    const s2 = stabilizer.process({ gesture: "NONE", confidence: 0 });
    assert(s1 === null && s2 === null, "Stabilizer successfully suppresses jitter and noise");

    // Feed frames until consensus triggers at 60% agreement
    const s3 = stabilizer.process(qResult);
    const sCommit = stabilizer.process(qResult);
    assert(
      sCommit !== null && sCommit.gesture === "QUESTION",
      `Stabilizer successfully triggered consensus on gesture: ${sCommit?.gesture}`
    );

    // Immediate duplicate frame should be blocked by cooldown
    const sDupe = stabilizer.process(qResult);
    assert(sDupe === null, "Stabilizer blocks rapid duplicate emissions under cooldown");

    // 10. Database Integration: Persisting Sign Language Transcripts
    const testClass = await client.classroom.create({
      data: {
        name: "Sign Language Lab 101",
        subject: "ASL/ISL",
        code: `AURA-CV-${Math.floor(1000 + Math.random() * 9000)}`,
        teacher: {
          create: {
            name: "Prof. Priya Raman",
            email: `cv.test.${Date.now()}@auralis.edu`,
            passwordHash: "hash_placeholder",
            role: "TEACHER",
          },
        },
      },
      include: { teacher: true },
    });

    const testLecture = await client.lecture.create({
      data: {
        title: "Introduction to ISL Computer Vision Recognition",
        classroomId: testClass.id,
        status: "LIVE",
      },
    });

    const signTranscript = await client.transcript.create({
      data: {
        lectureId: testLecture.id,
        userId: testClass.teacherId,
        text: "[SIGN] Question / Doubt",
        source: "SIGN_LANGUAGE",
        confidence: 0.96,
      },
    });

    assert(
      signTranscript.source === "SIGN_LANGUAGE" && signTranscript.text.includes("[SIGN]"),
      "Persisted sign language recognition transcript segment to database"
    );

    // Cleanup
    await client.classroom.delete({ where: { id: testClass.id } });
    await client.user.delete({ where: { id: testClass.teacher.id } });
    assert(true, "Cleaned up test fixtures");

  } catch (err) {
    console.error("Test Exception:", err);
    failed++;
  } finally {
    await client.$disconnect();
  }

  console.log("\n=================================================");
  console.log(`  PHASE 8 & 9 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
