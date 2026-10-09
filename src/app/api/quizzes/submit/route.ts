import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, answers } = await req.json();
    if (!quizId || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid quiz submission payload" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let correctCount = 0;
    const totalQuestions = quiz.questions.length || 1;

    quiz.questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns !== undefined && Number(userAns) === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= quiz.passingScore;

    // Determine attempt number
    const previousAttempts = await db.quizAttempt.count({
      where: {
        userId: user.id,
        quizId: quiz.id,
      },
    });

    const attemptNumber = previousAttempts + 1;

    const attempt = await db.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        score: scorePercent,
        passed,
        attemptNumber,
        answers: JSON.stringify(answers),
      },
    });

    await logSecurityEvent({
      userId: user.id,
      empId: user.empId,
      action: "QUIZ_SUBMITTED",
      details: `Submitted Quiz "${quiz.title}". Score: ${scorePercent}% (${passed ? "PASSED" : "FAILED"})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "Browser Client",
    });

    return NextResponse.json({
      success: true,
      score: scorePercent,
      passed,
      passingScore: quiz.passingScore,
      correctCount,
      totalQuestions,
      attemptNumber,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to submit quiz evaluation" }, { status: 500 });
  }
}
