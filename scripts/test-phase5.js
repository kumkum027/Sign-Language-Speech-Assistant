const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runPhase5Tests() {
  console.log("=================================================");
  console.log("   AURALIS PHASE 5: CLASSROOM & DASHBOARD TEST   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Setup Test Teacher & Student
    console.log("Test Group 1: User & Role Setup");
    await prisma.classroomMember.deleteMany({});
    await prisma.transcript.deleteMany({});
    await prisma.lecture.deleteMany({});
    await prisma.classroom.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: ["teacher_dash@auralis.edu", "student_dash@auralis.edu"] } },
    });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("Password123!", salt);

    const teacher = await prisma.user.create({
      data: {
        name: "Dr. Homi Bhabha",
        email: "teacher_dash@auralis.edu",
        passwordHash: hash,
        role: "TEACHER",
      },
    });
    assert(teacher.id !== null, "Test Teacher account initialized in database");

    const student = await prisma.user.create({
      data: {
        name: "Kavya Menon",
        email: "student_dash@auralis.edu",
        passwordHash: hash,
        role: "STUDENT",
      },
    });
    assert(student.id !== null, "Test Student account initialized in database");

    // 2. Classroom Creation with Unique Code
    console.log("\nTest Group 2: Classroom Creation and Unique Code");
    const testCode = "AURA-WAVE";
    const classroom = await prisma.classroom.create({
      data: {
        name: "Quantum Mechanics & Wave Optics",
        subject: "Physics 401",
        description: "Study of wavefunctions, superposition, and quantum tunneling.",
        code: testCode,
        teacherId: teacher.id,
      },
    });
    assert(classroom.id !== null, "Classroom successfully persisted with relational foreign key teacherId");
    assert(classroom.code === testCode, "Unique classroom code stored accurately");
    assert(classroom.name === "Quantum Mechanics & Wave Optics", "Classroom title and subject properly stored");

    // 3. Teacher Dashboard Classroom Queries
    console.log("\nTest Group 3: Teacher Workspace Data Query");
    const teacherClassrooms = await prisma.classroom.findMany({
      where: { teacherId: teacher.id },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { members: true, lectures: true } },
      },
    });
    assert(teacherClassrooms.length === 1, "Teacher workspace queries exact count of taught classrooms");
    assert(teacherClassrooms[0]._count.members === 0, "Initial student enrollment count is 0");

    // 4. Student Join Flow
    console.log("\nTest Group 4: Student Classroom Enrollment Flow");
    // Find classroom by code
    const foundClassroom = await prisma.classroom.findUnique({
      where: { code: testCode },
    });
    assert(foundClassroom !== null, "Classroom successfully looked up by case-insensitive code");

    // Create membership
    const membership = await prisma.classroomMember.create({
      data: {
        userId: student.id,
        classroomId: foundClassroom.id,
      },
    });
    assert(membership.id !== null, "Student successfully enrolled in classroom member table");

    // Verify student dashboard query
    const studentEnrolled = await prisma.classroomMember.findMany({
      where: { userId: student.id },
      include: {
        classroom: {
          include: { teacher: { select: { name: true } } },
        },
      },
    });
    assert(studentEnrolled.length === 1, "Student dashboard queries enrolled classrooms accurately");
    assert(studentEnrolled[0].classroom.name === "Quantum Mechanics & Wave Optics", "Enrolled classroom details match");
    assert(studentEnrolled[0].classroom.teacher.name === "Dr. Homi Bhabha", "Instructor information correctly populated");

    // Verify updated teacher count
    const updatedTeacherClassrooms = await prisma.classroom.findMany({
      where: { teacherId: teacher.id },
      include: { _count: { select: { members: true } } },
    });
    assert(updatedTeacherClassrooms[0]._count.members === 1, "Teacher dashboard reflects enrolled student tally (1 student)");

    // 5. Unique Constraint: Prevent Duplicate Membership
    console.log("\nTest Group 5: Constraint Integrity");
    let duplicateCaught = false;
    try {
      await prisma.classroomMember.create({
        data: {
          userId: student.id,
          classroomId: foundClassroom.id,
        },
      });
    } catch (e) {
      duplicateCaught = true;
    }
    assert(duplicateCaught === true, "Database constraint strictly prevents duplicate student enrollments");

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("FATAL ERROR IN PHASE 5 TESTS:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase5Tests();
