import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser, signToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: currentUser.id },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    await logSecurityEvent({
      userId: currentUser.id,
      empId: currentUser.empId,
      action: "PASSWORD_CHANGED",
      details: "User changed password successfully",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    // Update token cookie with updated payload
    const token = signToken({
      ...currentUser,
      mustChangePassword: false,
    });

    const response = NextResponse.json({ success: true, message: "Password updated successfully" });
    response.cookies.set("smc_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
