import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

if (process.env.VERCEL) {
  try {
    const tmpDbPath = "/tmp/dev.db";
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
      ];
      for (const dbPath of candidates) {
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, tmpDbPath);
          break;
        }
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  } catch (e) {
    console.error("Vercel DB copy error:", e);
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
