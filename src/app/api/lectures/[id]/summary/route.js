import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateLectureSummary, answerLectureQuestion } from "@/lib/ai-study";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const lectureId = params?.id;
    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID is required" }, { status: 400 });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        classroom: { select: { name: true, subject: true } },
        transcripts: {
          include: { speaker: { select: { name: true } } },
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const summaryData = generateLectureSummary(lecture.transcripts, lecture.classroom?.name);

    return NextResponse.json(
      {
        lectureId,
        title: lecture.title,
        classroomName: lecture.classroom?.name,
        subject: lecture.classroom?.subject,
        status: lecture.status,
        summary: summaryData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lecture Summary Error:", error);
    return NextResponse.json({ error: "Failed to generate lecture summary" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const lectureId = params?.id;
    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const question = body?.question;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question cannot be empty" }, { status: 400 });
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        classroom: { select: { name: true } },
        transcripts: {
          include: { speaker: { select: { name: true } } },
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const qaResult = answerLectureQuestion(lecture.transcripts, question);

    return NextResponse.json(
      {
        question,
        answer: qaResult.answer,
        citations: qaResult.citations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lecture Q&A Error:", error);
    return NextResponse.json({ error: "Failed to answer lecture question" }, { status: 500 });
  }
}
