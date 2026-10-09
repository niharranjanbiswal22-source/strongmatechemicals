"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, UserPlus, Sparkles, Factory, CheckCircle2, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regEmpId, setRegEmpId] = useState("");
  const [regDepartment, setRegDepartment] = useState("Technical Sales");
  const [regPassword, setRegPassword] = useState("");

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Login failed. Check your credentials.");
      }

      if (data.user.mustChangePassword) {
        router.push("/force-password");
      } else if (data.user.role === "ADMIN" || data.user.role === "TRAINER") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          empId: regEmpId,
          department: regDepartment,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccessMsg("Account created successfully! Logging you in...");
      setUsername(regEmail);
      setPassword(regPassword);

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regEmail, password: regPassword }),
      });
      const loginData = await loginRes.json();
      if (loginData.user) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setActiveTab("login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (userType: "learner" | "admin") => {
    setError(null);
    setSuccessMsg(null);
    setActiveTab("login");
    if (userType === "learner") {
      setUsername("SMC1001");
      setPassword("ChangeMe@123");
    } else {
      setUsername("admin@strongmatechemicals.com");
      setPassword("ChangeMe@123");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="relative h-8 sm:h-10 w-28 sm:w-44 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center">
              <Image
                src="/images/strongmate-logo.png"
                alt="Strongmate Chemicals Logo"
                fill
                className="object-contain p-0.5 sm:p-1"
                priority
              />
            </div>
            <div className="h-6 sm:h-8 w-px bg-slate-700 hidden sm:block"></div>
            <div className="relative h-8 sm:h-10 w-24 sm:w-40 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center">
              <Image
                src="/images/qlumate-logo.png"
                alt="Qlumate Brand Logo"
                fill
                className="object-contain p-0.5 sm:p-1"
                priority
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" /> 🔒 Protected Learning Portal
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Corporate Vision & Highlights */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Factory className="w-3.5 h-3.5" /> Strongmate Chemicals Pvt. Ltd.
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Strongmate Chemicals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400">
                New Joiner Training Portal
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Official corporate Learning Management System for SCPL joiners, trainers, sales executives, technical engineers, and plant trainees. Learn construction chemicals, waterproofing science, and Qlumate product application.
            </p>
          </div>

          {/* Key Security & Training Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Lock className="w-4 h-4" /> Encrypted Video Streaming
              </div>
              <p className="text-xs text-slate-400">
                Short-lived signed playback tokens & dynamic employee watermark overlay.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" /> Qlumate Product Academy
              </div>
              <p className="text-xs text-slate-400">
                Black Guard, White Guard, QLW-100, SBR Latex, and Epoxy Grouts SOPs.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Assessment & Certificates
              </div>
              <p className="text-xs text-slate-400">
                Automated quiz grading & QR verified training completion certificates.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Factory className="w-4 h-4" /> Balasore & Udaipur Units
              </div>
              <p className="text-xs text-slate-400">
                ISO 9001 certified manufacturing orientation & quality standards.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div id="login" className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {activeTab === "login" ? "User / Admin Sign In" : "Create Joiner Account"}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === "login"
                ? "Enter your registered Email Address or Employee ID to log in"
                : "Create a new employee learning account to access training courses"}
            </p>
          </div>

          {/* Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); setSuccessMsg(null); }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "login"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(null); setSuccessMsg(null); }}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "register"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-xs text-red-300 font-medium">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Email Address / Employee ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Email or Employee ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotSubmitted(false); }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>SIGN IN TO PORTAL</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@strongmatechemicals.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Employee ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SMC1025"
                    value={regEmpId}
                    onChange={(e) => setRegEmpId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Sales"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>CREATE ACCOUNT & START LEARNING</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Login Fill */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Quick Demo Fill Options:
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => loginAsDemo("learner")}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                User Login (SMC1001)
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo("admin")}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-red-400 border border-slate-700 transition"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" /> Password Reset Assistance
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 space-y-2 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-bold">Reset Instructions Dispatched</p>
                <p className="text-[11px] text-slate-300">
                  If <strong>{forgotEmail}</strong> matches an active SCPL training account, an administrator password reset link has been dispatched to your email.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSubmitted(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-300">
                  Enter your registered SCPL employee email address or Employee ID below. The training administrator will issue password reset instructions.
                </p>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Email / Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul@strongmatechemicals.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
                >
                  REQUEST PASSWORD RESET
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
