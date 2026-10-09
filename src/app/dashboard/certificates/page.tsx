import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import CertificateCard from "@/components/CertificateCard";
import { Award, Lock, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function LearnerCertificatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch Issued Certificates (ONLY generated when 100% videos completed)
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
    orderBy: { issueDate: "desc" },
  });

  // 2. Fetch Enrollments & Course Progress to display status for incomplete courses
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
  });

  const certificateCourseIds = new Set(certificates.map((c) => c.courseId));
  const pendingEnrollments = enrollments.filter((e) => !certificateCourseIds.has(e.courseId));

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-500" /> Training Completion Certificates
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Official SCPL credentials generated automatically upon watching 100% of course video lessons.
        </p>
      </div>

      {/* Granted Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Granted & Verified Certificates ({certificates.length})
          </h2>
          <div className="space-y-8">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificateId={cert.certificateId}
                learnerName={user.name}
                empId={user.empId}
                courseTitle={cert.course.title}
                issueDate={cert.issueDate}
                qrCodeData={cert.qrCodeData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked / Pending Course Certificates */}
      {pendingEnrollments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" /> Pending Certificates (Requires 100% Video Completion)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEnrollments.map((item) => {
              const videoCount = item.course.modules.reduce((sum, m) => sum + m.videos.length, 0);

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-400 text-[10px] font-bold border border-amber-800/60 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> LOCKED CERTIFICATE
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">{item.progress}%</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{item.course.title}</h3>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Watch remaining video lessons ({videoCount} total) to generate certificate.
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/courses/${item.course.id}`}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-red-400" />
                    <span>Watch Required Videos ({item.progress}% Done)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
