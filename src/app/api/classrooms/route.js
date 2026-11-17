import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createClassroomSchema } from "@/lib/validations/classroom";
import { generateUniqueClassroomCode } from "@/lib/classroom-code";

export const dynamic = "force-dynamic";

// GET /api/classrooms - Fetch user's classrooms (Taught or Enrolled)
export async function GET(req) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "TEACHER" || user.role === "ADMIN") {
      const classrooms = await prisma.classroom.findMany({
        where: { teacherId: user.id },
        include: {
          teacher: {
            select: { name: true, email: true },
          },
          _count: {
            select: { members: true, lectures: true },
          },
          lectures: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { id: true, title: true, status: true, startedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        { classrooms },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    } else {
      // Student - Fetch classrooms joined
      const memberships = await prisma.classroomMember.findMany({
        where: { userId: user.id },
        include: {
          classroom: {
            include: {
              teacher: {
                select: { name: true, email: true },
              },
              _count: {
                select: { members: true, lectures: true },
              },
              lectures: {
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, title: true, status: true, startedAt: true, endedAt: true },
              },
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      });

      const classrooms = memberships.map((m) => m.classroom);
      return NextResponse.json(
        { classrooms },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }
  } catch (error) {
    console.error("GET Classrooms Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

// POST /api/classrooms - Create a new classroom (Teachers/Admins only)
export async function POST(req) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only instructors can create classrooms" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = createClassroomSchema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Validation failed";
      return NextResponse.json(
        {
          error: firstError,
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, subject, description } = parseResult.data;
    const code = await generateUniqueClassroomCode();

    const newClassroom = await prisma.classroom.create({
      data: {
        name,
        subject,
        description: description || null,
        code,
        teacherId: user.id,
      },
      include: {
        teacher: {
          select: { name: true, email: true },
        },
        _count: {
          select: { members: true, lectures: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Classroom created successfully",
        classroom: newClassroom,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Classroom Error:", error);
    return NextResponse.json(
      { error: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
