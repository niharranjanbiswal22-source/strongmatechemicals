import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { User, ShieldCheck, Building2, Calendar, Mail, Phone, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <User className="w-7 h-7 text-red-500" /> My Employee Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personal details, department assignment, and security session logs.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-red-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <div className="text-xs font-mono text-amber-400">Employee ID: {user.empId}</div>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase">
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <Mail className="w-4 h-4 text-red-400" /> Email Address
            </div>
            <div className="text-white font-mono font-medium">{user.email}</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <Phone className="w-4 h-4 text-emerald-400" /> Phone
            </div>
            <div className="text-white font-mono font-medium">{dbUser?.phone || "N/A"}</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <Building2 className="w-4 h-4 text-amber-400" /> Department
            </div>
            <div className="text-white font-medium">{user.department}</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-4 h-4 text-blue-400" /> Joining Date
            </div>
            <div className="text-white font-medium">{formatDate(dbUser?.joiningDate)}</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Account Status: ACTIVE
          </span>
          <Link
            href="/force-password"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition font-semibold flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" /> Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
