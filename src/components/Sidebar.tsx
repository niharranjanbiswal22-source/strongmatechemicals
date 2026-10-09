"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Award,
  Bell,
  User,
  Users,
  Video,
  BarChart3,
  KeyRound,
  ShieldAlert,
  Settings,
} from "lucide-react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role = "LEARNER" }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN" || role === "TRAINER";

  const learnerLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Training", href: "/dashboard/courses", icon: BookOpen },
    { name: "Product Academy", href: "/dashboard/products", icon: Layers },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Assessments", href: "/dashboard/quizzes", icon: HelpCircle },
    { name: "Certificates", href: "/dashboard/certificates", icon: Award },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Learner Users", href: "/admin/users", icon: Users },
    { name: "Courses & Modules", href: "/admin/courses", icon: BookOpen },
    { name: "Videos & Security", href: "/admin/videos", icon: Video },
    { name: "Qlumate Products", href: "/admin/products", icon: Layers },
    { name: "Quizzes Builder", href: "/admin/quizzes", icon: HelpCircle },
    { name: "Documents", href: "/admin/documents", icon: FileText },
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "Security Audit Logs", href: "/admin/security", icon: ShieldAlert },
    { name: "Portal Settings", href: "/admin/settings", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : learnerLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden lg:block p-4 space-y-6 min-h-[calc(100vh-5rem)]">
      <div className="px-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          {isAdmin ? "Admin Navigation" : "Learner Portal"}
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ISO & Support info box */}
      <div className="pt-6 border-t border-slate-800 px-3">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-slate-200">Strongmate Chemicals</div>
          <div>Bhubaneswar • Odisha • India</div>
          <div className="text-[10px] text-emerald-400 font-semibold pt-1">An ISO Certified Company</div>
        </div>
      </div>
    </aside>
  );
}
