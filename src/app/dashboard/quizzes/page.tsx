import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { HelpCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default async function QuizzesListPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const quizzes = await db.quiz.findMany({
    include: {
      course: true,
      questions: true,
      quizAttempts: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-amber-500" /> Training Module Assessments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Verify product knowledge and application techniques before receiving your training certificate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => {
          const lastAttempt = quiz.quizAttempts[0];
          const hasPassed = quiz.quizAttempts.some((a) => a.passed);

          return (
            <div
              key={quiz.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/50 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800/60 rounded text-amber-400 font-bold">
                    {quiz.course.title}
                  </span>
                  {hasPassed && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{quiz.title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>{quiz.questions.length} Questions</span>
                  <span>•</span>
                  <span>Passing: {quiz.passingScore}%</span>
                  <span>•</span>
                  <span>Time: {quiz.timeLimitMinutes} mins</span>
                </div>

                {lastAttempt && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Last Score: <strong className="text-white">{lastAttempt.score}%</strong></span>
                    <span className="text-slate-500">Attempt {lastAttempt.attemptNumber} of {quiz.maxAttempts}</span>
                  </div>
                )}
              </div>

              <Link
                href={`/dashboard/quizzes/${quiz.id}`}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <span>{hasPassed ? "RETAKE ASSESSMENT" : "START ASSESSMENT NOW"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
