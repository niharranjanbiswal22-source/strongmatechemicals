import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const videos = await db.video.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        _count: {
          select: { videoProgress: true },
        },
      },
    });

    const courses = await db.course.findMany({
      include: {
        modules: true,
      },
    });

    return NextResponse.json({ videos, courses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch video management data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      completionThreshold,
      courseId,
      moduleId,
      newModuleName,
    } = await req.json();

    if (!title || !videoUrl || !courseId) {
      return NextResponse.json({ error: "Title, Video URL, and Course Selection are required" }, { status: 400 });
    }

    let targetModuleId = moduleId;

    // If new module name provided, create module first
    if (!targetModuleId && newModuleName) {
      const newModule = await db.module.create({
        data: {
          courseId,
          title: newModuleName.trim(),
          description: "Admin Created Module",
        },
      });
      targetModuleId = newModule.id;
    }

    if (!targetModuleId) {
      const existingModules = await db.module.findMany({ where: { courseId } });
      if (existingModules.length > 0) {
        targetModuleId = existingModules[0].id;
      } else {
        const defaultModule = await db.module.create({
          data: {
            courseId,
            title: "Module 1: Training Basics",
            description: "Default Module",
          },
        });
        targetModuleId = defaultModule.id;
      }
    }

    const newVideo = await db.video.create({
      data: {
        moduleId: targetModuleId,
        title: title.trim(),
        description: description ? description.trim() : "Protected SCPL Training Video",
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
        duration: Number(duration) || 300,
        completionThreshold: Number(completionThreshold) || 90,
        status: "ACTIVE",
        isEncrypted: true,
      },
    });

    await logSecurityEvent({
      userId: admin.id,
      empId: admin.empId,
      action: "VIDEO_UPLOADED_BY_ADMIN",
      details: `Admin uploaded new training video "${newVideo.title}" (${newVideo.id})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json({ error: "Failed to upload training video" }, { status: 500 });
  }
}
