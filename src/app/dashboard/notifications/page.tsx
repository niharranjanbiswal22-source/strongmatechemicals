import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Bell, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const announcements = await db.announcement.findMany({
    where: { targetRole: { in: ["ALL", user.role] } },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Bell className="w-7 h-7 text-red-500" /> Announcements & Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Official corporate updates and training notices from Strongmate R&D and Management.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-red-950/80 border border-red-800/60 rounded text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5" /> {ann.priority} NOTICE
              </span>
              <span className="text-xs text-slate-400 font-mono">{formatDate(ann.createdAt)}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{ann.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ann.content}</p>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Published by: <span className="text-white font-semibold">{ann.author.name}</span> ({ann.author.department})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
