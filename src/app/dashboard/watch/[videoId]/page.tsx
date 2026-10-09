import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import VideoPlayer from "@/components/VideoPlayer";
import { ArrowLeft, BookOpen, Lock, ShieldCheck } from "lucide-react";

export default async function WatchVideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { videoId } = await params;

  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  videos: {
                    orderBy: { orderIndex: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!video) notFound();

  // Fetch previous video progress for initial seek position
  const videoProgress = await db.videoProgress.findUnique({
    where: {
      userId_videoId: {
        userId: user.id,
        videoId: video.id,
      },
    },
  });

  const initialPos = videoProgress?.lastPosition || 0;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href={`/dashboard/courses/${video.module.course.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Modules
        </Link>

        <div className="flex items-center gap-2 text-xs text-red-400 font-semibold bg-red-950/60 border border-red-800/60 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" /> SCPL Confidential Stream
        </div>
      </div>

      {/* Main Player Component */}
      <div className="space-y-4">
        <VideoPlayer
          videoId={video.id}
          videoTitle={video.title}
          initialPosition={initialPos}
          empName={user.name}
          empId={user.empId}
          sessionId={user.sessionId}
        />

        {/* Video Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                {video.module.course.title} • {video.module.title}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {video.title}
              </h1>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Req Threshold: {video.completionThreshold}%
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {video.description || "No description provided for this lesson."}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              This playback is recorded and watermarked with your Employee ID ({user.empId}) for security auditing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
