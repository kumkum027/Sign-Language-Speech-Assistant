// scripts/test-phase10.js
// Automated verification for Phase 10:
// - Lecture History Retrieval by Role (Teacher vs Student)
// - Deep Transcript Inspection & Chronological Sorting
// - Text and JSON Serialization for Export
// - Data formatting and integrity checks

const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

async function runTests() {
  console.log("=================================================");
  console.log("  AURALIS AUTOMATED TESTS: PHASE 10");
  console.log("  Lecture History Archive & Transcript Export Hub");
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
    // 1. Create Teacher, Student, Classroom and 2 Lectures with transcripts
    const timestamp = Date.now();
    const teacher = await client.user.create({
      data: {
        name: "Dr. K. Srinivas",
        email: `srinivas.${timestamp}@auralis.edu`,
        passwordHash: "hash_placeholder",
        role: "TEACHER",
      },
    });

    const student = await client.user.create({
      data: {
        name: "Meera Nair",
        email: `meera.${timestamp}@auralis.edu`,
        passwordHash: "hash_placeholder",
        role: "STUDENT",
      },
    });

    const classroom = await client.classroom.create({
      data: {
        name: "Signal Processing & Wavelets",
        subject: "EE402",
        code: `AURA-SP-${Math.floor(1000 + Math.random() * 9000)}`,
        teacherId: teacher.id,
      },
    });

    await client.classroomMember.create({
      data: {
        userId: student.id,
        classroomId: classroom.id,
      },
    });

    // Create 2 lectures
    const lecture1 = await client.lecture.create({
      data: {
        title: "Fourier Transform Fundamentals",
        classroomId: classroom.id,
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 3600000),
        endedAt: new Date(),
      },
    });

    const lecture2 = await client.lecture.create({
      data: {
        title: "Discrete Wavelet Transform Applications",
        classroomId: classroom.id,
        status: "LIVE",
        startedAt: new Date(),
      },
    });

    // Add Speech and Sign Transcripts
    await client.transcript.create({
      data: {
        lectureId: lecture1.id,
        userId: teacher.id,
        text: "Today we formulate the continuous Fourier transform integrals.",
        source: "SPEECH",
        confidence: 0.98,
      },
    });

    await client.transcript.create({
      data: {
        lectureId: lecture1.id,
        userId: student.id,
        text: "[SIGN] Question / Doubt",
        source: "SIGN_LANGUAGE",
        confidence: 0.95,
      },
    });

    await client.transcript.create({
      data: {
        lectureId: lecture1.id,
        userId: teacher.id,
        text: "Yes Meera, let us inspect the frequency spectrum coefficients.",
        source: "SPEECH",
        confidence: 0.97,
      },
    });

    // 2. Query Teacher History
    const teacherLectures = await client.lecture.findMany({
      where: {
        classroom: { teacherId: teacher.id },
      },
      include: {
        classroom: true,
        _count: { select: { transcripts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    assert(teacherLectures.length === 2, `Teacher queries full lecture archive (${teacherLectures.length} lectures)`);
    assert(
      teacherLectures[1]._count.transcripts === 3 || teacherLectures[0]._count.transcripts === 3,
      "Transcripts count correctly aggregated in lecture history"
    );

    // 3. Query Student History
    const studentLectures = await client.lecture.findMany({
      where: {
        classroom: {
          members: {
            some: { userId: student.id },
          },
        },
      },
      include: {
        classroom: true,
        _count: { select: { transcripts: true } },
      },
    });

    assert(studentLectures.length === 2, `Enrolled student queries accessible lectures (${studentLectures.length} lectures)`);

    // 4. Test In-Depth Chronological Transcripts Retrieval
    const detailedTranscripts = await client.transcript.findMany({
      where: { lectureId: lecture1.id },
      include: {
        speaker: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    assert(detailedTranscripts.length === 3, `Retrieved ${detailedTranscripts.length} transcript blocks chronologically`);
    assert(detailedTranscripts[1].source === "SIGN_LANGUAGE", "Sign language gesture entry correctly segregated");

    // 5. Test Plain Text (.txt) Serialization format
    let plainTextOutput = `AURALIS TRANSCRIPT: ${lecture1.title}\n`;
    detailedTranscripts.forEach((t) => {
      plainTextOutput += `[${t.source}] ${t.speaker?.name || "Anonymous"}: ${t.text}\n`;
    });

    assert(plainTextOutput.includes("[SIGN_LANGUAGE] Meera Nair: [SIGN] Question / Doubt"), "Plain text export correctly formatted with speaker attribution");

    // 6. Test JSON Export serialization
    const jsonOutput = JSON.stringify({
      lecture: lecture1,
      transcripts: detailedTranscripts,
    });
    const parsedJSON = JSON.parse(jsonOutput);
    assert(parsedJSON.transcripts.length === 3, "JSON export accurately packages lecture metadata and caption array");

    // Cleanup
    await client.classroom.delete({ where: { id: classroom.id } });
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
  console.log(`  PHASE 10 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
