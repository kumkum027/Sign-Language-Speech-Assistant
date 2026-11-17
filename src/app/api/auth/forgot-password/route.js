import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { signResetToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const parseResult = forgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found associated with this email address." },
        { status: 404 }
      );
    }

    // Generate secure 1-hour reset token
    const resetToken = signResetToken({
      id: user.id,
      email: user.email,
    });

    const resetUrl = `/reset-password?token=${encodeURIComponent(resetToken)}`;

    return NextResponse.json(
      {
        message: "Password reset authorization generated successfully.",
        resetToken,
        resetUrl,
        user: { name: user.name, email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing password reset request." },
      { status: 500 }
    );
  }
}
