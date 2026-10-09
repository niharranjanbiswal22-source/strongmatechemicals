import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const accessCodes = await db.accessCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accessCodes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch access codes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code, description, maxUses, expiresAtDays, courseIds } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Access code string is required" }, { status: 400 });
    }

    const existing = await db.accessCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Access Code already exists" }, { status: 400 });
    }

    const expiresAt = expiresAtDays ? new Date(Date.now() + Number(expiresAtDays) * 24 * 60 * 60 * 1000) : null;

    const newCode = await db.accessCode.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description || "Training Access Code",
        maxUses: Number(maxUses) || 100,
        expiresAt,
        courseIds: JSON.stringify(courseIds || []),
        status: "ACTIVE",
      },
    });

    await logSecurityEvent({
      userId: admin.id,
      empId: admin.empId,
      action: "ACCESS_CODE_CREATED",
      details: `Created code ${newCode.code} (Max uses: ${newCode.maxUses})`,
    });

    return NextResponse.json({ success: true, accessCode: newCode });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create access code" }, { status: 500 });
  }
}
