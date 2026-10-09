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

    const courses = await db.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        modules: {
          include: { videos: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, description, category, difficulty, estimatedDuration, thumbnail } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Course title and description are required" }, { status: 400 });
    }

    const newCourse = await db.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || "Technical Science",
        difficulty: difficulty || "Beginner",
        estimatedDuration: estimatedDuration || "2 Hours",
        thumbnail: thumbnail || "/images/courses/company-orientation.jpg",
        trainerId: admin.id,
        status: "PUBLISHED",
      },
    });

    // Auto-create initial Module 1
    await db.module.create({
      data: {
        courseId: newCourse.id,
        title: "Module 1: Orientation & Basics",
        description: "Introduction module",
        orderIndex: 1,
      },
    });

    await logSecurityEvent({
      userId: admin.id,
      empId: admin.empId,
      action: "COURSE_CREATED",
      details: `Admin created course "${newCourse.title}"`,
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
