"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ShieldCheck, Bell, Award, BookOpen, Layers } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    empId: string;
    email: string;
    role: string;
    department: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logos */}
        <Link href={user ? (user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard") : "/"} className="flex items-center gap-3 sm:gap-5 group">
          {/* Strongmate Logo */}
          <div className="relative h-8 sm:h-10 w-28 sm:w-44 bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center transition-transform group-hover:scale-102">
            <Image
              src="/images/strongmate-logo.png"
              alt="Strongmate Chemicals Logo"
              fill
              className="object-contain p-0.5 sm:p-1"
              priority
            />
          </div>

          <div className="h-6 sm:h-8 w-px bg-slate-700 hidden xs:block sm:block"></div>

          {/* Qlumate Brand Logo */}
          <div className="relative h-8 sm:h-10 w-24 sm:w-40 bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center transition-transform group-hover:scale-102">
            <Image
              src="/images/qlumate-logo.png"
              alt="Qlumate Brand Logo"
              fill
              className="object-contain p-0.5 sm:p-1"
              priority
            />
          </div>
        </Link>

        {/* Right Section: User Profile or Login CTA */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Quick Links for Learner */}
            {user.role === "LEARNER" && (
              <div className="hidden md:flex items-center gap-2 mr-2">
                <Link
                  href="/dashboard/courses"
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
                >
                  <BookOpen className="w-3.5 h-3.5 text-red-400" /> My Training
                </Link>
                <Link
                  href="/dashboard/products"
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Products
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Certificates
                </Link>
              </div>
            )}

            {/* Notification Bell */}
            <Link
              href={user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard/notifications"}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition relative border border-slate-700/80"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
            </Link>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-700 p-1.5 pr-3 rounded-xl border border-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-red-700 text-white font-bold text-xs flex items-center justify-center shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {user.name.split(" ")[0]}
                    {user.role !== "LEARNER" && (
                      <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded font-semibold uppercase">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {user.empId}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-slate-200 divide-y divide-slate-800">
                  <div className="p-3">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">
                        {user.department}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-red-400 font-semibold transition"
                      >
                        <ShieldCheck className="w-4 h-4" /> Admin Control Portal
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-300 transition"
                      >
                        <User className="w-4 h-4" /> My Joiner Profile
                      </Link>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-red-950/60 text-red-400 flex items-center gap-2 font-medium transition"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/#login"
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/40 transition flex items-center gap-2"
          >
            <span>JOINER LOGIN</span>
          </Link>
        )}
      </div>
    </header>
  );
}
