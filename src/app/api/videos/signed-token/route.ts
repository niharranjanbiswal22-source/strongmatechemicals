import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, generateVideoSignedToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const video = await db.video.findUnique({
      where: { id: videoId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 44 });
    }

    // Verify user authorization: Admins & Trainers have full access; Learners need enrollment or active status
    if (user.role === "LEARNER") {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: video.module.courseId,
          },
        },
      });

      // If user is not explicitly enrolled, auto-enroll or check if published course
      if (!enrollment && video.module.course.status !== "PUBLISHED") {
        await logSecurityEvent({
          userId: user.id,
          empId: user.empId,
          action: "UNAUTHORIZED_VIDEO_ACCESS_DENIED",
          details: `User attempted to access unpublished course video ${videoId}`,
          severity: "WARNING",
        });
        return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
      }
    }

    // Generate short-lived signed playback token (60 seconds expiry)
    const token = generateVideoSignedToken(user.id, video.id, user.empId);

    await logSecurityEvent({
      userId: user.id,
      empId: user.empId,
      action: "VIDEO_STREAM_TOKEN_GENERATED",
      details: `Generated short-lived streaming token for video: ${video.title} (${video.id})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    return NextResponse.json({
      success: true,
      signedToken: token,
      expiresInSeconds: 60,
      streamUrl: `/api/videos/stream?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    console.error("Signed token error:", error);
    return NextResponse.json({ error: "Failed to authorize video playback" }, { status: 500 });
  }
}
