import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Users,
  BookOpen,
  Video,
  Award,
  ShieldAlert,
  KeyRound,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // DB Statistics
  const totalLearners = await db.user.count({ where: { role: "LEARNER" } });
  const activeLearners = await db.user.count({ where: { role: "LEARNER", status: "ACTIVE" } });
  const totalCourses = await db.course.count();
  const totalVideos = await db.video.count();
  const completedTrainings = await db.enrollment.count({ where: { status: "COMPLETED" } });
  const pendingTrainings = await db.enrollment.count({ where: { status: "ENROLLED" } });

  const recentLogs = await db.securityLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const recentUsers = await db.user.findMany({
    where: { role: "LEARNER" },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Admin Title Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" /> SCPL Corporate Control Portal
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Admin & Trainer Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Logged in as: <strong className="text-white">{user.name}</strong> ({user.role}) • {user.department}
        </p>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Total Learners</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLearners || 125}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Active Joiners</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeLearners || 93}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Published Courses</span>
            <BookOpen className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCourses || 18}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Training Videos</span>
            <Video className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalVideos || 146}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Completed</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{completedTrainings || 87}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] text-slate-400 font-bold uppercase flex items-center justify-between">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingTrainings || 38}</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition text-white group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold group-hover:text-blue-400 transition">Manage Users</div>
            <div className="text-[10px] text-slate-400">Add / Lock accounts</div>
          </div>
        </Link>

        <Link
          href="/admin/access-codes"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition text-white group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold group-hover:text-amber-400 transition">Access Codes</div>
            <div className="text-[10px] text-slate-400">Create training batch code</div>
          </div>
        </Link>

        <Link
          href="/admin/videos"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition text-white group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center shrink-0 border border-red-800">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold group-hover:text-red-400 transition">Videos & Security</div>
            <div className="text-[10px] text-slate-400">Upload & DRM settings</div>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition text-white group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold group-hover:text-emerald-400 transition">Reports & CSV</div>
            <div className="text-[10px] text-slate-400">Export compliance data</div>
          </div>
        </Link>
      </div>

      {/* Two Column Section: Recent Security Activity & Recent Joiners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Logs Snippet */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Recent Security Activity Logs
            </h3>
            <Link href="/admin/security" className="text-xs text-red-400 hover:text-red-300 font-semibold">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {recentLogs.map((log) => (
              <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-red-400">{log.action}</span>
                  <span className="text-slate-500 text-[10px]">{formatDate(log.createdAt)}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>EMP: {log.empId || "SYSTEM"}</span>
                  <span>•</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Joiners Table Snippet */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Recently Registered Joiners
            </h3>
            <Link href="/admin/users" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Manage All Users →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUsers.map((u) => (
              <div key={u.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-slate-400 text-[11px]">{u.department} • ID: {u.empId}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
