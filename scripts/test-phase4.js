const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = "auralis-super-secure-production-ready-jwt-secret-key-32-chars-min";

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function runAuthTests() {
  console.log("=================================================");
  console.log("   AURALIS PHASE 4: AUTH & DATABASE TEST SUITE   ");
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
    // 1. Password Hashing and Verification
    console.log("Test Group 1: Cryptographic Password Security");
    const plain = "StrongClassroomPassword!123";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);
    assert(hash !== plain, "Password is fully hashed (not plain text)");
    assert(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Password uses industry standard bcrypt salt");
    const isMatch = await bcrypt.compare(plain, hash);
    assert(isMatch === true, "Valid password successfully verified against bcrypt hash");
    const isWrongMatch = await bcrypt.compare("WrongPassword", hash);
    assert(isWrongMatch === false, "Incorrect password properly rejected by bcrypt");

    // 2. JWT Generation and Decryption
    console.log("\nTest Group 2: JWT Issuance and Verification");
    const testSession = {
      id: "test-user-id-123",
      name: "Dr. Raman",
      email: "raman@university.edu",
      role: "TEACHER",
    };
    const token = jwt.sign(testSession, JWT_SECRET, { expiresIn: "7d" });
    assert(typeof token === "string" && token.length > 20, "JWT token successfully signed");
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded !== null, "JWT token successfully decrypted and verified");
    assert(decoded.email === "raman@university.edu", "Decoded JWT preserves user identity and email");
    assert(decoded.role === "TEACHER", "Decoded JWT preserves role-based authorization");

    // 3. Schema Validation
    console.log("\nTest Group 3: Input Validation with Zod");
    const validReg = registerSchema.safeParse({
      name: "Aarav Patel",
      email: "aarav@university.edu",
      password: "Password123",
      role: "STUDENT",
    });
    assert(validReg.success === true, "Valid registration input accepted by Zod");

    const invalidEmailReg = registerSchema.safeParse({
      name: "Aarav Patel",
      email: "not-an-email",
      password: "Password123",
      role: "STUDENT",
    });
    assert(invalidEmailReg.success === false, "Malformed email rejected by Zod schema");

    const shortPasswordReg = registerSchema.safeParse({
      name: "Aarav Patel",
      email: "aarav@university.edu",
      password: "123",
      role: "STUDENT",
    });
    assert(shortPasswordReg.success === false, "Password shorter than 6 characters rejected");

    // 4. Database CRUD with Prisma
    console.log("\nTest Group 4: Prisma Database Integration");
    // Clean up test records if they exist
    await prisma.user.deleteMany({
      where: {
        email: { in: ["test_teacher@auralis.edu", "test_student@auralis.edu"] },
      },
    });

    // Create Teacher User
    const teacherSalt = await bcrypt.genSalt(10);
    const teacherHash = await bcrypt.hash("TeacherPassword2026!", teacherSalt);
    const teacher = await prisma.user.create({
      data: {
        name: "Prof. Vikram Sarabhai",
        email: "test_teacher@auralis.edu",
        passwordHash: teacherHash,
        role: "TEACHER",
      },
    });
    assert(teacher.id !== undefined && teacher.id.length > 0, "Teacher user created in database with unique cuid");
    assert(teacher.role === "TEACHER", "Teacher user assigned correct TEACHER role");

    // Create Student User
    const studentSalt = await bcrypt.genSalt(10);
    const studentHash = await bcrypt.hash("StudentPassword2026!", studentSalt);
    const student = await prisma.user.create({
      data: {
        name: "Priya Sharma",
        email: "test_student@auralis.edu",
        passwordHash: studentHash,
        role: "STUDENT",
      },
    });
    assert(student.id !== undefined && student.id.length > 0, "Student user created in database");
    assert(student.role === "STUDENT", "Student user assigned correct STUDENT role");

    // Test unique email constraint
    let caughtDuplicate = false;
    try {
      await prisma.user.create({
        data: {
          name: "Duplicate User",
          email: "test_teacher@auralis.edu",
          passwordHash: "dummyHash",
          role: "TEACHER",
        },
      });
    } catch (e) {
      caughtDuplicate = true;
    }
    assert(caughtDuplicate === true, "Database uniquely enforces single email per account");

    // Query user by email
    const fetchedUser = await prisma.user.findUnique({
      where: { email: "test_teacher@auralis.edu" },
    });
    assert(fetchedUser?.name === "Prof. Vikram Sarabhai", "Prisma successfully queries user by unique indexed email");

    console.log("\n=================================================");
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("FATAL TEST EXCEPTION:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTests();
