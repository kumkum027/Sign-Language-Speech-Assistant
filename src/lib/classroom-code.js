import prisma from "@/lib/prisma";

export async function generateUniqueClassroomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit ambiguous characters
  let isUnique = false;
  let finalCode = "";

  while (!isUnique) {
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    finalCode = `AURA-${randomPart}`;

    const existing = await prisma.classroom.findUnique({
      where: { code: finalCode },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return finalCode;
}
