import { db } from "./db";

export async function logSecurityEvent({
  userId,
  empId,
  action,
  details,
  ipAddress,
  userAgent,
  severity = "INFO",
}: {
  userId?: string;
  empId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
}) {
  try {
    await db.securityLog.create({
      data: {
        userId: userId || null,
        empId: empId || null,
        action,
        details,
        ipAddress: ipAddress || "127.0.0.1",
        userAgent: userAgent || "Browser Client",
        severity,
      },
    });
  } catch (e) {
    console.error("Failed to log security event:", e);
  }
}

// In-memory rate limiting map for login attempts
const failedAttemptsMap = new Map<string, { count: number; lockUntil: number }>();

export function checkRateLimit(key: string): { allowed: boolean; remainingLocks: number } {
  const now = Date.now();
  const entry = failedAttemptsMap.get(key);

  if (!entry) return { allowed: true, remainingLocks: 0 };

  if (entry.lockUntil > now) {
    const remainingSeconds = Math.ceil((entry.lockUntil - now) / 1000);
    return { allowed: false, remainingLocks: remainingSeconds };
  }

  if (entry.lockUntil <= now && entry.count >= 5) {
    failedAttemptsMap.delete(key);
  }

  return { allowed: true, remainingLocks: 0 };
}

export function recordFailedAttempt(key: string): number {
  const now = Date.now();
  const entry = failedAttemptsMap.get(key) || { count: 0, lockUntil: 0 };

  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockUntil = now + 15 * 60 * 1000; // 15 minute lock
  }

  failedAttemptsMap.set(key, entry);
  return entry.count;
}

export function clearFailedAttempts(key: string) {
  failedAttemptsMap.delete(key);
}
