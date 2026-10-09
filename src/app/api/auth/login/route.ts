import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts, logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { username, password, accessCode } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const rateKey = `login_${username || ip}`;
    const rateCheck = checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      await logSecurityEvent({
        action: "LOGIN_RATE_LIMITED",
        details: `Too many failed attempts for ${username}. Locked for ${rateCheck.remainingLocks} seconds.`,
        ipAddress: ip,
        userAgent,
        severity: "WARNING",
      });
      return NextResponse.json(
        { error: `Account temporarily locked due to repeated failed attempts. Try again in ${rateCheck.remainingLocks} seconds.` },
        { status: 429 }
      );
    }

    // Handle Optional Training Access Code Login Flow
    if (accessCode) {
      const codeRecord = await db.accessCode.findUnique({
        where: { code: accessCode.trim() },
      });

      if (!codeRecord || codeRecord.status !== "ACTIVE") {
        return NextResponse.json({ error: "Invalid or inactive Training Access Code" }, { status: 400 });
      }

      if (codeRecord.expiresAt && new Date() > codeRecord.expiresAt) {
        return NextResponse.json({ error: "This Training Access Code has expired" }, { status: 400 });
      }

      if (codeRecord.usedCount >= codeRecord.maxUses) {
        return NextResponse.json({ error: "Maximum user limit reached for this access code" }, { status: 400 });
      }

      // Find or create temporary access code user
      const tempEmpId = `ACC-${codeRecord.code.replace(/[^A-Z0-9]/gi, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const tempUser = await db.user.create({
        data: {
          empId: tempEmpId,
          name: `Trainee (${codeRecord.code})`,
          email: `${tempEmpId.toLowerCase()}@training.strongmate.internal`,
          role: "LEARNER",
          department: "Access Code Trainee",
          designation: "Field Trainee",
          passwordHash: await bcrypt.hash(accessCode, 10),
          mustChangePassword: false,
          status: "ACTIVE",
        },
      });

      // Increment access code count
      await db.accessCode.update({
        where: { id: codeRecord.id },
        data: { usedCount: { increment: 1 } },
      });

      // Enroll temp user in assigned courses if specified
      let assignedCourseIds: string[] = [];
      try {
        assignedCourseIds = JSON.parse(codeRecord.courseIds || "[]");
      } catch (e) {}

      if (assignedCourseIds.length === 0) {
        const allCourses = await db.course.findMany({ select: { id: true } });
        assignedCourseIds = allCourses.map((c) => c.id);
      }

      for (const cId of assignedCourseIds) {
        await db.enrollment.upsert({
          where: { userId_courseId: { userId: tempUser.id, courseId: cId } },
          create: { userId: tempUser.id, courseId: cId, status: "ENROLLED" },
          update: {},
        });
      }

      // Create session
      const newSession = await db.session.create({
        data: {
          userId: tempUser.id,
          token: Math.random().toString(36).substring(2) + Date.now(),
          ipAddress: ip,
          userAgent,
          deviceType: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
        },
      });

      const token = signToken({
        id: tempUser.id,
        empId: tempUser.empId,
        email: tempUser.email,
        name: tempUser.name,
        role: tempUser.role as any,
        department: tempUser.department,
        designation: tempUser.designation,
        mustChangePassword: false,
        sessionId: newSession.id,
      });

      await logSecurityEvent({
        userId: tempUser.id,
        empId: tempUser.empId,
        action: "ACCESS_CODE_LOGIN",
        details: `LoggedIn via Access Code ${codeRecord.code}`,
        ipAddress: ip,
        userAgent,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: tempUser.id,
          empId: tempUser.empId,
          name: tempUser.name,
          role: tempUser.role,
          mustChangePassword: false,
        },
      });

      response.cookies.set("smc_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 12 * 60 * 60,
      });

      return response;
    }

    // Standard Login Flow
    if (!username || !password) {
      return NextResponse.json({ error: "Employee ID/Email and Password are required" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          { empId: username.trim() },
          { email: username.trim().toLowerCase() },
        ],
      },
    });

    if (!user) {
      recordFailedAttempt(rateKey);
      await logSecurityEvent({
        action: "LOGIN_FAILED",
        details: `Invalid credentials for ${username}`,
        ipAddress: ip,
        userAgent,
        severity: "WARNING",
      });
      return NextResponse.json({ error: "Invalid Employee ID / Email or Password" }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      await logSecurityEvent({
        userId: user.id,
        empId: user.empId,
        action: "LOGIN_BLOCKED",
        details: "Attempted login on suspended account",
        ipAddress: ip,
        userAgent,
        severity: "CRITICAL",
      });
      return NextResponse.json({ error: "Account is suspended. Please contact SCPL Training Administrator." }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const attempts = recordFailedAttempt(rateKey);
      await logSecurityEvent({
        userId: user.id,
        empId: user.empId,
        action: "LOGIN_FAILED",
        details: `Incorrect password (Attempt ${attempts}/5)`,
        ipAddress: ip,
        userAgent,
        severity: "WARNING",
      });

      if (attempts >= 5) {
        return NextResponse.json(
          { error: "Account lock triggered due to 5 consecutive failed attempts. Try again in 15 minutes." },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Invalid Employee ID / Email or Password" }, { status: 401 });
    }

    clearFailedAttempts(rateKey);

    // Single Device Enforcement: Invalidate previous active sessions if present
    await db.session.updateMany({
      where: { userId: user.id, isValid: true },
      data: { isValid: false },
    });

    // Create new session
    const newSession = await db.session.create({
      data: {
        userId: user.id,
        token: Math.random().toString(36).substring(2) + Date.now(),
        ipAddress: ip,
        userAgent,
        deviceType: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
        isValid: true,
      },
    });

    // Update user's lastActiveAt
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const token = signToken({
      id: user.id,
      empId: user.empId,
      email: user.email,
      name: user.name,
      role: user.role as any,
      department: user.department,
      designation: user.designation,
      mustChangePassword: user.mustChangePassword,
      sessionId: newSession.id,
    });

    await logSecurityEvent({
      userId: user.id,
      empId: user.empId,
      action: "USER_LOGIN_SUCCESS",
      details: `Successful login as ${user.role} from ${ip}`,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        empId: user.empId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        mustChangePassword: user.mustChangePassword,
      },
    });

    response.cookies.set("smc_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal server error during login" }, { status: 500 });
  }
}
