import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { joinClassroomSchema } from "@/lib/validations/classroom";

export async function POST(req) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = joinClassroomSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid classroom code format",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { code } = parseResult.data;

    // Find classroom by unique code
    const classroom = await prisma.classroom.findUnique({
      where: { code },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "No classroom found with code: " + code + ". Please check the code with your instructor." },
        { status: 404 }
      );
    }

    // Check if user is the teacher
    if (classroom.teacherId === user.id) {
      return NextResponse.json(
        {
          message: "You are the instructor of this classroom",
          classroom,
        },
        { status: 200 }
      );
    }

    // Check if student is already enrolled
    const existingMembership = await prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: user.id,
          classroomId: classroom.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          message: "You are already enrolled in this classroom",
          classroom,
        },
        { status: 200 }
      );
    }

    // Create membership record
    await prisma.classroomMember.create({
      data: {
        userId: user.id,
        classroomId: classroom.id,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully joined " + classroom.name,
        classroom,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Join Classroom Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while joining classroom" },
      { status: 500 }
    );
  }
}
