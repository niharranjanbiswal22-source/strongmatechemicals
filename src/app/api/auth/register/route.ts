import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const { name, email, empId, department, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Full Name, Email Address, and Password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = empId ? empId.trim() : `SMC${Math.floor(1000 + Math.random() * 9000)}`;

    // Check duplicate email or empId
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { empId: cleanEmpId },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this Email Address or Employee ID already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        empId: cleanEmpId,
        name: name.trim(),
        email: cleanEmail,
        role: "LEARNER",
        department: department ? department.trim() : "New Joiners",
        designation: "Trainee",
        passwordHash,
        status: "ACTIVE",
        mustChangePassword: false,
      },
    });

    // Auto-enroll new user into published training courses
    const publishedCourses = await db.course.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true },
    });

    for (const c of publishedCourses) {
      await db.enrollment.create({
        data: {
          userId: newUser.id,
          courseId: c.id,
          status: "ENROLLED",
          progress: 0,
        },
      });
    }

    await logSecurityEvent({
      userId: newUser.id,
      empId: newUser.empId,
      action: "USER_REGISTERED_SELF",
      details: `New User signed up: ${newUser.name} (${newUser.email})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now log in.",
      user: {
        id: newUser.id,
        empId: newUser.empId,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
  }
}
