"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  question: string;
  options: string[];
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: Question[];
}

export default function QuizTakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${id}`);
        if (!res.ok) {
          // Fallback fetch from db via standard endpoint or construct
          const fallbackRes = await fetch(`/api/admin/quizzes`);
          const data = await fallbackRes.json();
          const q = data.quizzes?.find((item: any) => item.id === id);
          if (q) {
            setQuiz({
              ...q,
              questions: q.questions.map((qn: any) => ({
                ...qn,
                options: typeof qn.options === "string" ? JSON.parse(qn.options) : qn.options,
              })),
            });
            setTimeLeft(q.timeLimitMinutes * 60);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, answers }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.passed) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading assessment questions...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center text-white bg-slate-900 rounded-2xl border border-slate-800">
        Quiz assessment not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/quizzes"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assessments List
      </Link>

      {/* Quiz Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            SCPL Knowledge Evaluation
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">
            {quiz.title}
          </h1>
        </div>

        {!result && (
          <div className="bg-slate-950 border border-amber-500/40 px-4 py-2 rounded-2xl text-center shrink-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Time Remaining</div>
            <div className="text-xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" /> {formatTimer(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* Result Display Banner */}
      {result && (
        <div
          className={`border rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-center ${
            result.passed
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-100"
              : "bg-red-950/80 border-red-500 text-red-100"
          }`}
        >
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-black/40 border border-current">
            {result.passed ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>

          <h2 className="text-2xl font-extrabold">
            {result.passed ? "Assessment Passed! 🎉" : "Assessment Failed"}
          </h2>

          <div className="text-3xl font-extrabold font-mono">
            Your Score: {result.score}%
          </div>

          <p className="text-xs sm:text-sm max-w-md mx-auto">
            {result.passed
              ? `Congratulations! You answered ${result.correctCount} out of ${result.totalQuestions} questions correctly (Required: ${result.passingScore}%). Your certificate has been granted!`
              : `You scored ${result.score}%, but the passing threshold is ${result.passingScore}%. Please review the training videos and retry.`}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition border border-slate-700"
            >
              Retry Quiz
            </button>
            {result.passed && (
              <Link
                href="/dashboard/certificates"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Award className="w-4 h-4" /> View Certificate
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                Q{qIndex + 1}
              </span>
              <h3 className="text-base font-bold text-white pt-0.5">{q.question}</h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pl-10">
              {q.options.map((option, optIdx) => {
                const isSelected = answers[q.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={!!result}
                    onClick={() => handleSelectOption(q.id, optIdx)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium transition border flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-600/20 border-amber-500 text-amber-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!result && (
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < quiz.questions.length}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl text-sm font-bold shadow-xl transition disabled:opacity-50"
          >
            {submitting ? "EVALUATING RESPONSES..." : "SUBMIT QUIZ ASSESSMENT"}
          </button>
        </div>
      )}
    </div>
  );
}
