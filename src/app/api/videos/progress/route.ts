import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId, lastPosition, totalDuration } = await req.json();

    if (!videoId || typeof lastPosition !== "number") {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 });
    }

    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        module: {
          select: { courseId: true },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const duration = totalDuration || video.duration || 1;
    const watchedPercentage = Math.min(100, Math.round((lastPosition / duration) * 100));
    const threshold = video.completionThreshold || 90;
    const isCompleted = watchedPercentage >= threshold;

    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const device = req.headers.get("user-agent") || "Browser Client";

    // Upsert video progress record
    const existingProgress = await db.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: video.id,
        },
      },
    });

    // Don't downgrade watched percentage or completed status
    const finalWatchedPercentage = Math.max(existingProgress?.watchedPercentage || 0, watchedPercentage);
    const finalIsCompleted = (existingProgress?.isCompleted || false) || isCompleted;

    const progressRecord = await db.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: video.id,
        },
      },
      create: {
        userId: user.id,
        videoId: video.id,
        courseId: video.module.courseId,
        lastPosition,
        watchedPercentage: finalWatchedPercentage,
        isCompleted: finalIsCompleted,
        device,
        ipAddress,
      },
      update: {
        lastPosition,
        watchedPercentage: finalWatchedPercentage,
        isCompleted: finalIsCompleted,
        device,
        ipAddress,
      },
    });

    // Recalculate Course Overall Progress
    const allCourseVideos = await db.video.findMany({
      where: {
        module: {
          courseId: video.module.courseId,
        },
      },
      select: { id: true },
    });

    const completedUserVideos = await db.videoProgress.count({
      where: {
        userId: user.id,
        courseId: video.module.courseId,
        isCompleted: true,
      },
    });

    const totalVideosCount = allCourseVideos.length || 1;
    const courseProgressPercent = Math.min(100, Math.round((completedUserVideos / totalVideosCount) * 100));
    const isCourseCompleted = courseProgressPercent >= 100;

    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: video.module.courseId,
        },
      },
      create: {
        userId: user.id,
        courseId: video.module.courseId,
        status: isCourseCompleted ? "COMPLETED" : "ENROLLED",
        progress: courseProgressPercent,
        completedAt: isCourseCompleted ? new Date() : null,
      },
      update: {
        progress: courseProgressPercent,
        status: isCourseCompleted ? "COMPLETED" : undefined,
        completedAt: isCourseCompleted ? new Date() : undefined,
      },
    });

    // If course is completed, check if certificate already issued; if not, issue certificate!
    if (isCourseCompleted) {
      const certId = `SMC-QP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      await db.certificate.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: video.module.courseId,
          },
        },
        create: {
          certificateId: certId,
          userId: user.id,
          courseId: video.module.courseId,
          qrCodeData: `https://strongmatechemicals.com/verify-certificate?id=${certId}`,
        },
        update: {},
      });
    }

    return NextResponse.json({
      success: true,
      videoProgress: {
        watchedPercentage: finalWatchedPercentage,
        isCompleted: finalIsCompleted,
        lastPosition,
      },
      courseProgressPercent,
      isCourseCompleted,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: "Failed to record video progress" }, { status: 500 });
  }
}
