import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/lectures - Start / Create a new live lecture
export async function POST(req) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only instructors can start lectures" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { classroomId, title, status = "LIVE", transcripts = [] } = body;

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId is required" }, { status: 400 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    if (classroom.teacherId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not the teacher of this classroom" },
        { status: 403 }
      );
    }

    // Set any currently active lectures in this classroom to COMPLETED first
    if (status === "LIVE") {
      await prisma.lecture.updateMany({
        where: { classroomId, status: "LIVE" },
        data: { status: "COMPLETED", endedAt: new Date() },
      });
    }

    const lectureTitle =
      title?.trim() ||
      `${classroom.subject} Lecture – ${new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })}`;

    const newLecture = await prisma.lecture.create({
      data: {
        title: lectureTitle,
        classroomId,
        status: status === "COMPLETED" ? "COMPLETED" : "LIVE",
        startedAt: new Date(),
        endedAt: status === "COMPLETED" ? new Date() : null,
      },
      include: {
        classroom: {
          select: { name: true, subject: true, code: true },
        },
      },
    });

    // If transcripts were attached, bulk save them
    if (Array.isArray(transcripts) && transcripts.length > 0) {
      const formatted = transcripts
        .filter((t) => t?.text)
        .map((t) => ({
          lectureId: newLecture.id,
          userId: t.speaker?.id || user.id,
          text: t.text,
          source: t.source || "SPEECH",
          confidence: t.confidence || 0.95,
          timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
        }));

      if (formatted.length > 0) {
        await prisma.transcript.createMany({
          data: formatted,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Lecture processed successfully",
        lecture: newLecture,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Lecture Error:", error);
    return NextResponse.json(
      { error: "Failed to start lecture" },
      { status: 500 }
    );
  }
}

// GET /api/lectures - Retrieve lectures for a classroom or full lecture history for current user
export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");

    const whereClause = {};
    if (classroomId) {
      whereClause.classroomId = classroomId;
    } else {
      const userRole = (user.role || "").toUpperCase();
      if (userRole === "ADMIN") {
        // ADMIN sees all lectures across the institution
      } else {
        // Show lectures from all classrooms the user owns or is enrolled in
        whereClause.OR = [
          { classroom: { teacherId: user.id } },
          { classroom: { members: { some: { userId: user.id } } } },
        ];
      }
    }

    const lectures = await prisma.lecture.findMany({
      where: whereClause,
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            subject: true,
            code: true,
            teacher: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { transcripts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { lectures },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GET Lectures Error:", error);
    return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 });
  }
}
