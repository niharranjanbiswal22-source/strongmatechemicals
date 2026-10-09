import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShieldAlert, Lock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminSecurityPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const logs = await db.securityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-red-500" /> Security Audit & Access Logs
        </h1>
        <p className="text-xs text-slate-400">
          Real-time record of employee logins, signed stream token requests, rate limits, and focus security pauses.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Emp ID</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono text-slate-400">{formatDate(log.createdAt)}</td>
                  <td className="p-4 font-mono font-bold text-red-400">{log.action}</td>
                  <td className="p-4 font-mono text-amber-400">{log.empId || "SYSTEM"}</td>
                  <td className="p-4 text-slate-300">{log.details}</td>
                  <td className="p-4 font-mono text-slate-400">{log.ipAddress}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === "CRITICAL"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : log.severity === "WARNING"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-blue-950 text-blue-400 border border-blue-800"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
