import { PrismaClient } from "@prisma/client";

// Guard against invalid cloud container DATABASE_URL pointing to localhost
if (typeof process !== "undefined" && process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")) {
    delete process.env.DATABASE_URL;
  }
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
