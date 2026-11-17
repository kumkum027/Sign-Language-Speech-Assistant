import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/lectures/[id]/transcripts - Retrieve all transcripts for a lecture
export async function GET(req, { params }) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const lecture = await prisma.lecture.findUnique({
      where: { id },
      include: {
        classroom: true,
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // Check membership / teacher status
    const isTeacher = lecture.classroom.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isTeacher && !isAdmin) {
      const membership = await prisma.classroomMember.findUnique({
        where: {
          userId_classroomId: {
            userId: user.id,
            classroomId: lecture.classroomId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Forbidden: You are not enrolled in this classroom" },
          { status: 403 }
        );
      }
    }

    const transcripts = await prisma.transcript.findMany({
      where: { lectureId: id },
      include: {
        speaker: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(
      {
        lecture: {
          id: lecture.id,
          title: lecture.title,
          status: lecture.status,
          startedAt: lecture.startedAt,
          endedAt: lecture.endedAt,
          classroomName: lecture.classroom.name,
          classroomSubject: lecture.classroom.subject,
        },
        transcripts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Lecture Transcripts Error:", error);
    return NextResponse.json({ error: "Failed to fetch lecture transcripts" }, { status: 500 });
  }
}
