import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  BookOpen,
  Award,
  Clock,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  Megaphone,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function LearnerDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Fetch enrolled courses & progress
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              videos: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  // If no enrollments exist yet, auto-enroll user in published courses
  let userEnrollments = enrollments;
  if (userEnrollments.length === 0) {
    const publishedCourses = await db.course.findMany({
      where: { status: "PUBLISHED" },
    });

    for (const c of publishedCourses) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: c.id,
          status: "ENROLLED",
          progress: 0,
        },
      });
    }

    userEnrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                videos: true,
              },
            },
          },
        },
      },
    });
  }

  // Fetch total completed videos & certificates count
  const certificatesCount = await db.certificate.count({
    where: { userId: user.id },
  });

  const announcements = await db.announcement.findMany({
    where: { targetRole: { in: ["ALL", "LEARNER"] } },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalCourses = userEnrollments.length;
  const completedCourses = userEnrollments.filter((e) => e.status === "COMPLETED").length;
  const inProgressCourses = userEnrollments.filter((e) => e.status === "ENROLLED" && e.progress > 0).length;

  const totalProgressSum = userEnrollments.reduce((sum, e) => sum + e.progress, 0);
  const overallProgressPercent = totalCourses > 0 ? Math.round(totalProgressSum / totalCourses) : 0;

  // Find active course to continue
  const activeEnrollment = userEnrollments.find((e) => e.status === "ENROLLED") || userEnrollments[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 text-[11px] font-bold uppercase tracking-wider">
                SCPL Joiner Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                EMP ID: {user.empId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name.split(" ")[0]} 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Department: <strong className="text-white">{user.department}</strong> • Designation: <strong className="text-white">{user.designation}</strong>
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center min-w-[200px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Overall Training Progress
            </div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400 font-mono">
              {overallProgressPercent}%
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Assigned Courses</span>
            <BookOpen className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCourses}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{inProgressCourses}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{completedCourses}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Certificates</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{certificatesCount}</div>
        </div>
      </div>

      {/* Active Continue Learning Card */}
      {activeEnrollment && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-red-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-red-400 tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-current" /> Continue Where You Stopped
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeEnrollment.progress}% Completed
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              {activeEnrollment.course.title}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-2">
              {activeEnrollment.course.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              Modules: {activeEnrollment.course.modules.length} • Duration: {activeEnrollment.course.estimatedDuration}
            </div>
            <Link
              href={`/dashboard/courses/${activeEnrollment.course.id}`}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-950/50"
            >
              <span>CONTINUE TRAINING</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* My Training Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" /> My Training Courses
          </h2>
          <Link
            href="/dashboard/courses"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            View All Courses ({userEnrollments.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEnrollments.map((item) => {
            const videoCount = item.course.modules.reduce((total, m) => total + m.videos.length, 0);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {item.course.category}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {item.status === "COMPLETED" ? "COMPLETED ✓" : `${item.progress}%`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {item.course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.course.modules.length} Modules</span>
                    <span>{videoCount} Video Lessons</span>
                  </div>

                  <Link
                    href={`/dashboard/courses/${item.course.id}`}
                    className="w-full py-2.5 bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 hover:border-red-600"
                  >
                    <span>{item.status === "COMPLETED" ? "REVIEW COURSE" : "OPEN COURSE"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qlumate Product Academy Showcase */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Technical Product Masterclass
            </span>
            <h3 className="text-xl font-bold text-white">QLUMATE PRODUCT ACADEMY</h3>
          </div>
          <Link
            href="/dashboard/products"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Browse All Products
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {["Waterproofing", "Concrete Admixtures", "Wall Finishing", "Tile Fixing", "Cool Coating"].map((cat) => (
            <Link
              key={cat}
              href={`/dashboard/products?category=${encodeURIComponent(cat)}`}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-center space-y-1 transition group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">
                {cat}
              </div>
              <div className="text-[10px] text-slate-400">Technical SOPs & Videos</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> Recent Announcements
          </h2>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">{ann.title}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(ann.createdAt)}</span>
                </div>
                <p className="text-slate-300">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
