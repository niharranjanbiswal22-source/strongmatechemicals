import React from "react";
import Image from "next/image";
import { db } from "@/lib/db";
import { ShieldCheck, CheckCircle2, Award, Calendar, User, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const certificateId = params.id;

  if (!certificateId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold">Certificate ID Missing</h2>
          <p className="text-xs text-slate-400">
            Please provide a valid Strongmate Certificate ID to verify credential authenticity.
          </p>
        </div>
      </div>
    );
  }

  const certificate = await db.certificate.findUnique({
    where: { certificateId },
    include: {
      user: true,
      course: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-36 bg-white px-2 py-1 rounded">
              <Image src="/images/strongmate-logo.png" alt="Strongmate" fill className="object-contain" />
            </div>
            <div className="relative h-9 w-32 bg-white px-2 py-1 rounded">
              <Image src="/images/qlumate-logo.png" alt="Qlumate" fill className="object-contain" />
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Verification Portal
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-8 flex items-center justify-center">
        {certificate ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 w-full space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  VERIFIED AUTHENTIC CREDENTIAL
                </span>
                <h1 className="text-xl font-bold text-white">Strongmate Chemicals Certificate</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Learner Name
                </div>
                <div className="font-bold text-white text-base">{certificate.user.name}</div>
                <div className="text-xs text-slate-400 font-mono">EMP ID: {certificate.user.empId}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-red-400" /> Program Completed
                </div>
                <div className="font-bold text-white text-sm">{certificate.course.title}</div>
                <div className="text-xs text-emerald-400 font-medium">Qlumate Certified Standard</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Issue Date
                </div>
                <div className="font-semibold text-white">{formatDate(certificate.issueDate)}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">Certificate ID</div>
                <div className="font-mono font-bold text-amber-400">{certificate.certificateId}</div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-slate-400">
              Issued by R&D & Technical Application Division, Strongmate Chemicals Pvt. Ltd., Bhubaneswar, Odisha.
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-red-900/50 rounded-3xl p-8 w-full text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 flex items-center justify-center mx-auto">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-red-400">Certificate Not Found</h2>
            <p className="text-xs text-slate-300">
              The requested certificate ID <code className="text-white font-mono">{certificateId}</code> was not found in the official SCPL database.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
