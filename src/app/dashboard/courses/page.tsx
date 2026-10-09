import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function CourseCatalogPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      modules: {
        include: { videos: true },
      },
      trainer: true,
      enrollments: {
        where: { userId: user.id },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-red-500" /> SCPL Training Courses Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Master construction chemicals, waterproofing technology, and Qlumate product application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const enrollment = course.enrollments[0];
          const progress = enrollment?.progress || 0;
          const isCompleted = enrollment?.status === "COMPLETED";
          const videoCount = course.modules.reduce((sum, m) => sum + m.videos.length, 0);

          return (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-red-400 font-semibold border border-slate-700">
                    {course.category}
                  </span>
                  <span className="text-slate-400">{course.difficulty}</span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Your Progress</span>
                    <span className="text-amber-400 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Duration: {course.estimatedDuration}</span>
                  <span>{videoCount} Video Lessons</span>
                </div>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
                >
                  <span>{isCompleted ? "REVIEW MODULES" : "START / CONTINUE COURSE"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
