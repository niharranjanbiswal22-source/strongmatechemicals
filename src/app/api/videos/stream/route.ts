import { NextRequest, NextResponse } from "next/server";
import { verifyVideoSignedToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Forbidden: Access token missing", { status: 403 });
    }

    const tokenData = verifyVideoSignedToken(token);
    if (!tokenData) {
      return new NextResponse("Forbidden: Stream token expired or invalid", { status: 403 });
    }

    const video = await db.video.findUnique({
      where: { id: tokenData.videoId },
    });

    if (!video || !video.videoUrl) {
      return new NextResponse("Video stream unavailable", { status: 404 });
    }

    // Secure proxy stream or external signed redirect
    const videoRes = await fetch(video.videoUrl, {
      headers: {
        Range: req.headers.get("range") || "bytes=0-",
      },
    });

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", videoRes.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Content-Length", videoRes.headers.get("content-length") || "");
    if (videoRes.headers.get("content-range")) {
      responseHeaders.set("Content-Range", videoRes.headers.get("content-range") || "");
    }
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("Content-Disposition", "inline");

    return new NextResponse(videoRes.body as any, {
      status: videoRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream API Error:", error);
    return new NextResponse("Streaming error", { status: 500 });
  }
}
