"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, Lock } from "lucide-react";

interface ConfidentialModalProps {
  isOpen: boolean;
  onAgree: () => void;
  videoTitle: string;
}

export default function ConfidentialModal({
  isOpen,
  onAgree,
  videoTitle,
}: ConfidentialModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-600/50 flex items-center justify-center text-red-500 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-red-400 tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Security & Confidentiality Notice
            </span>
            <h3 className="text-lg font-bold text-white leading-snug">
              Protected Training Video
            </h3>
          </div>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 text-sm text-slate-300">
          <p className="font-semibold text-white">
            Video: &ldquo;{videoTitle}&rdquo;
          </p>
          <p className="leading-relaxed text-xs md:text-sm">
            This training content is the proprietary & confidential property of{" "}
            <span className="text-white font-medium">Strongmate Chemicals Pvt. Ltd. (SCPL)</span>.
          </p>

          <ul className="space-y-2 text-xs text-slate-400 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>Unauthorized screen recording, downloading, or redistribution is strictly prohibited and audited.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>A unique dynamic employee watermark is embedded over playback to trace account activity.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>Playback will automatically pause if focus is switched to another window.</span>
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={onAgree}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 px-5 rounded-xl shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 group"
          >
            <CheckCircle2 className="w-5 h-5 text-red-200 group-hover:scale-110 transition-transform" />
            <span>I Understand & Continue to Training</span>
          </button>
        </div>
      </div>
    </div>
  );
}
