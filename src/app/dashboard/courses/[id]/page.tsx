import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, Play, CheckCircle2, Clock, HelpCircle, FileText, Lock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      trainer: true,
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          videos: {
            orderBy: { orderIndex: "asc" },
            include: {
              videoProgress: {
                where: { userId: user.id },
              },
            },
          },
          quizzes: true,
        },
      },
      quizzes: true,
      documents: true,
      enrollments: {
        where: { userId: user.id },
      },
    },
  });

  if (!course) notFound();

  const enrollment = course.enrollments[0];
  const progressPercent = enrollment?.progress || 0;

  return (
    <div className="space-y-8">
      {/* Course Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="px-3 py-1 bg-red-950/80 border border-red-800/60 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider">
            {course.category}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Trainer: <strong className="text-white">{course.trainer?.name || "SCPL R&D Technical Team"}</strong>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {course.description}
          </p>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-w-lg space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">Your Progress</span>
            <span className="text-amber-400 font-mono text-sm">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-500" /> Course Modules & Protected Lessons
        </h2>

        {course.modules.map((moduleItem, index) => (
          <div
            key={moduleItem.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  MODULE {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
                <h3 className="text-lg font-bold text-white">{moduleItem.title}</h3>
                {moduleItem.description && (
                  <p className="text-xs text-slate-400">{moduleItem.description}</p>
                )}
              </div>
            </div>

            {/* Videos in Module */}
            <div className="space-y-3">
              {moduleItem.videos.map((vid) => {
                const vp = vid.videoProgress[0];
                const isCompleted = vp?.isCompleted || false;
                const watchedPct = vp?.watchedPercentage || 0;

                return (
                  <div
                    key={vid.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      {vid.thumbnailUrl ? (
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 shadow">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-black/60" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{vid.title}</h4>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{vid.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(vid.duration)}
                          </span>
                          <span>•</span>
                          <span>Req: {vid.completionThreshold}% watch</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {watchedPct > 0 && (
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-amber-400">{watchedPct}%</div>
                          <div className="text-[10px] text-slate-400">Watched</div>
                        </div>
                      )}

                      <Link
                        href={`/dashboard/watch/${vid.id}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                          isCompleted
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                            : "bg-red-600 hover:bg-red-500 text-white shadow-red-950/50"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? "REWATCH" : watchedPct > 0 ? "RESUME" : "WATCH NOW"}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quizzes in Module */}
            {moduleItem.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{quiz.title}</h4>
                    <p className="text-xs text-slate-400">
                      Passing score: {quiz.passingScore}% • Time Limit: {quiz.timeLimitMinutes} mins
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/quizzes/${quiz.id}`}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  TAKE QUIZ
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Associated Technical Documents */}
      {course.documents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Technical Data Sheets & SOP Documents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                  <span className="text-[10px] text-slate-400">{doc.category}</span>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
