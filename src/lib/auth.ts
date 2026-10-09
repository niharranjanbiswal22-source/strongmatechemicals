import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "strongmate-secret-jwt-key-2026-secure-qlumate";

export interface UserPayload {
  id: string;
  empId: string;
  email: string;
  name: string;
  role: "ADMIN" | "TRAINER" | "LEARNER";
  department: string;
  designation: string;
  mustChangePassword: boolean;
  sessionId?: string;
}

export function signToken(payload: UserPayload, expiresIn: SignOptions["expiresIn"] = "12h"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("smc_session_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Check if session in DB is still valid (Single-Device Enforcement)
  if (payload.sessionId) {
    const activeSession = await db.session.findUnique({
      where: { id: payload.sessionId },
    });
    if (!activeSession || !activeSession.isValid) {
      return null;
    }

    // Update last activity
    await db.session.update({
      where: { id: payload.sessionId },
      data: { lastActivity: new Date() },
    });
  }

  // Fetch latest user data from DB
  const user = await db.user.findUnique({
    where: { id: payload.id },
  });

  if (!user || user.status === "SUSPENDED") return null;

  return {
    id: user.id,
    empId: user.empId,
    email: user.email,
    name: user.name,
    role: user.role as any,
    department: user.department,
    designation: user.designation,
    mustChangePassword: user.mustChangePassword,
    sessionId: payload.sessionId,
  };
}

export function generateVideoSignedToken(userId: string, videoId: string, empId: string): string {
  return jwt.sign(
    {
      userId,
      videoId,
      empId,
      purpose: "video_streaming",
    },
    JWT_SECRET,
    { expiresIn: "60s" }
  );
}

export function verifyVideoSignedToken(token: string): { userId: string; videoId: string; empId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.purpose !== "video_streaming") return null;
    return {
      userId: decoded.userId,
      videoId: decoded.videoId,
      empId: decoded.empId,
    };
  } catch {
    return null;
  }
}
