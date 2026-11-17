import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { verifyResetToken, hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const parseResult = resetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, password } = parseResult.data;

    // Verify token validity and purpose
    const decoded = verifyResetToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Password reset authorization is invalid or has expired. Please request a new link." },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account could not be identified." },
        { status: 404 }
      );
    }

    // Hash new password and update in database
    const newHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json(
      {
        message: "Your password has been successfully updated. You may now sign in with your new credentials.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while updating password." },
      { status: 500 }
    );
  }
}
