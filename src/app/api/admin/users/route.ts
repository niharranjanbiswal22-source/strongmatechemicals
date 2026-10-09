import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        empId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        status: true,
        mustChangePassword: true,
        joiningDate: true,
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { empId, name, email, phone, role, department, designation, password } = await req.json();

    if (!empId || !name || !email || !password) {
      return NextResponse.json({ error: "Employee ID, Name, Email, and Password are required" }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.user.findFirst({
      where: {
        OR: [{ empId: empId.trim() }, { email: email.trim().toLowerCase() }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "User with this Employee ID or Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        empId: empId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        role: role || "LEARNER",
        department: department || "New Joiners",
        designation: designation || "Trainee",
        passwordHash,
        status: "ACTIVE",
        mustChangePassword: true,
      },
    });

    await logSecurityEvent({
      userId: admin.id,
      empId: admin.empId,
      action: "USER_CREATED",
      details: `Created new user ${newUser.name} (${newUser.empId}) as ${newUser.role}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { userId, status, password, role } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
      updateData.mustChangePassword = true;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // If suspended, invalidate all active sessions
    if (status === "SUSPENDED") {
      await db.session.updateMany({
        where: { userId },
        data: { isValid: false },
      });
    }

    await logSecurityEvent({
      userId: admin.id,
      empId: admin.empId,
      action: "USER_UPDATED",
      details: `Updated user ${updatedUser.empId} (Status: ${updatedUser.status}, Role: ${updatedUser.role})`,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
