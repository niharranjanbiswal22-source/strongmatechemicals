"use client";

import React, { useEffect, useState } from "react";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SessionTimeout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetIdleTimer = () => {
      setShowWarning(false);
      clearTimeout(idleTimer);
      clearInterval(countdownInterval);

      // Set warning after 25 minutes of inactivity (1500000 ms)
      idleTimer = setTimeout(() => {
        setShowWarning(true);
        setCountdown(60);

        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 25 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      clearInterval(countdownInterval);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleContinue = () => {
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Session Timeout Warning</h3>
            <p className="text-xs text-amber-300">Inactivity Limit Reached</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Your training session is about to expire due to inactivity. You will be automatically logged out in{" "}
          <strong className="text-amber-400 font-mono text-base">{countdown}s</strong>.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleContinue}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Continue Session
          </button>
          <button
            onClick={handleLogout}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
