import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/auth";
import { getSessionUser, verifyPassword, hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, currentPassword, newPassword } = parseResult.data;

    // Fetch full existing user record
    const existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    // Check if new email is taken by someone else
    if (email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailConflict) {
        return NextResponse.json(
          { error: "Another account is already registered with this email address." },
          { status: 409 }
        );
      }
    }

    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    // If changing password, verify existing password first
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to authorize setting a new password." },
          { status: 400 }
        );
      }

      const isCurrentValid = await verifyPassword(currentPassword, existingUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Current password does not match our records." },
          { status: 401 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // Perform database update
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // Re-issue session cookie with updated credentials
    const updatedSessionPayload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
    const newToken = signToken(updatedSessionPayload);
    setAuthCookie(newToken);

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        user: updatedSessionPayload,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while updating profile." },
      { status: 500 }
    );
  }
}
