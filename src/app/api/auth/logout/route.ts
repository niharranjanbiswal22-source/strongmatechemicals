import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user && user.sessionId) {
      await db.session.update({
        where: { id: user.sessionId },
        data: { isValid: false },
      });

      await logSecurityEvent({
        userId: user.id,
        empId: user.empId,
        action: "USER_LOGOUT",
        details: "User initiated logout",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent") || "Browser Client",
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("smc_session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
