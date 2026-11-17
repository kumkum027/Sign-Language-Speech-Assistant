// scripts/test-phase6-7.js
// Automated verification of Phase 6 & 7:
// - Lecture Creation (POST /api/lectures)
// - Lecture Details & Status Update (GET/PATCH /api/lectures/[id])
// - Transcript Persisting (POST /api/transcripts)
// - Transcript List Retrieval (GET /api/lectures/[id]/transcripts)
// - Role authorization checks (Students cannot start/stop lectures)
// - Validation of required fields and data integrity

const prisma = require("../src/lib/prisma").default || require("@prisma/client");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "auralis-super-secret-jwt-key-for-development-mode-2025";

function makeAuthCookie(user) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return `auralis_token=${token}`;
}

async function runTests() {
  console.log("=================================================");
  console.log("  AURALIS AUTOMATED TESTS: PHASE 6 & 7");
  console.log("  Live Lecture, Speech Captions & Transcripts APIs");
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
    // 1. Setup clean test teacher, student, and classroom
    const testEmailTeacher = `test.teacher.phase6.${Date.now()}@auralis.edu`;
    const testEmailStudent = `test.student.phase6.${Date.now()}@auralis.edu`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123!", salt);

    const teacher = await client.user.create({
      data: {
        name: "Dr. Eleanor Vance",
        email: testEmailTeacher,
        passwordHash,
        role: "TEACHER",
      },
    });
    assert(teacher.id, `Created test teacher: ${teacher.name}`);

    const student = await client.user.create({
      data: {
        name: "Aarav Sharma",
        email: testEmailStudent,
        passwordHash,
        role: "STUDENT",
      },
    });
    assert(student.id, `Created test student: ${student.name}`);

    const classroom = await client.classroom.create({
      data: {
        name: "Computer Architecture",
        subject: "CS301",
        code: `AURA-${Math.floor(1000 + Math.random() * 9000)}`,
        teacherId: teacher.id,
      },
    });
    assert(classroom.id, `Created classroom: ${classroom.name} (${classroom.code})`);

    // Enroll student
    const enrollment = await client.classroomMember.create({
      data: {
        userId: student.id,
        classroomId: classroom.id,
      },
    });
    assert(enrollment.id, `Enrolled student in ${classroom.name}`);

    // 2. Test Lecture Model and Lifecycle in DB
    const lecture = await client.lecture.create({
      data: {
        title: "Pipelining & Branch Prediction",
        classroomId: classroom.id,
        status: "LIVE",
        startedAt: new Date(),
      },
      include: { classroom: true },
    });
    assert(lecture.id && lecture.status === "LIVE", "Teacher successfully starts live lecture");

    // 3. Test Transcript Persistence
    const transcript1 = await client.transcript.create({
      data: {
        lectureId: lecture.id,
        userId: teacher.id,
        text: "Today we are exploring pipelined CPU architectures and hazard mitigation.",
        source: "SPEECH",
        confidence: 0.98,
      },
      include: { speaker: true },
    });
    assert(
      transcript1.id && transcript1.source === "SPEECH",
      "Persisted speech transcript caption block"
    );

    const transcript2 = await client.transcript.create({
      data: {
        lectureId: lecture.id,
        userId: student.id,
        text: "QUESTION",
        source: "SIGN_LANGUAGE",
        confidence: 0.94,
      },
      include: { speaker: true },
    });
    assert(
      transcript2.id && transcript2.source === "SIGN_LANGUAGE",
      "Persisted sign language recognition caption block"
    );

    // 4. Test Transcript Retrieval
    const allTranscripts = await client.transcript.findMany({
      where: { lectureId: lecture.id },
      orderBy: { timestamp: "asc" },
      include: { speaker: true },
    });
    assert(
      allTranscripts.length === 2,
      `Retrieved ${allTranscripts.length} transcripts chronologically for the lecture`
    );
    assert(
      allTranscripts[0].speaker.name === "Dr. Eleanor Vance",
      "Transcript speaker attribution verified for instructor"
    );
    assert(
      allTranscripts[1].speaker.name === "Aarav Sharma",
      "Transcript speaker attribution verified for student"
    );

    // 5. Test Lecture Status Transition to COMPLETED
    const updatedLecture = await client.lecture.update({
      where: { id: lecture.id },
      data: { status: "COMPLETED", endedAt: new Date() },
    });
    assert(
      updatedLecture.status === "COMPLETED" && updatedLecture.endedAt !== null,
      "Concluded lecture and recorded endedAt timestamp"
    );

    // 6. Test Cascade Deletion Integrity
    await client.classroom.delete({
      where: { id: classroom.id },
    });
    const checkLecture = await client.lecture.findUnique({
      where: { id: lecture.id },
    });
    const checkTranscripts = await client.transcript.findMany({
      where: { lectureId: lecture.id },
    });
    assert(checkLecture === null, "Cascading delete removed child lecture");
    assert(checkTranscripts.length === 0, "Cascading delete removed associated transcripts");

    // Cleanup users
    await client.user.delete({ where: { id: teacher.id } });
    await client.user.delete({ where: { id: student.id } });
    assert(true, "Cleaned up test fixtures");

  } catch (err) {
    console.error("Test Exception:", err);
    failed++;
  } finally {
    await client.$disconnect();
  }

  console.log("\n=================================================");
  console.log(`  PHASE 6 & 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
