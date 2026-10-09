"use client";

import React, { useState } from "react";
import { Settings, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [securityLevel, setSecurityLevel] = useState("HIGH_SECURITY");
  const [singleDevice, setSingleDevice] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-400" /> System & Video Security Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure video DRM levels, single session enforcement, and dynamic watermark frequency.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {saved && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Security settings updated successfully.
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase text-slate-300">
            Video Security Protection Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "STANDARD", title: "STANDARD", desc: "Basic signed URLs & authentication" },
              { id: "PROTECTED", title: "PROTECTED", desc: "Signed URLs + Watermark + Focus pause" },
              { id: "HIGH_SECURITY", title: "HIGH SECURITY", desc: "Encrypted stream + Watermark + Single Device + Audit" },
            ].map((lvl) => (
              <div
                key={lvl.id}
                onClick={() => setSecurityLevel(lvl.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  securityLevel === lvl.id
                    ? "bg-red-950/60 border-red-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-400" /> {lvl.title}
                </div>
                <div className="text-[11px] mt-1 text-slate-300">{lvl.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Single Device Active Session Mode</div>
              <div className="text-[11px] text-slate-400">Terminates older sessions when a new device logs into the same account.</div>
            </div>
            <input
              type="checkbox"
              checked={singleDevice}
              onChange={(e) => setSingleDevice(e.target.checked)}
              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Dynamic Employee Watermark Overlay</div>
              <div className="text-[11px] text-slate-400">Renders employee name, ID, and IP address moving across video playback.</div>
            </div>
            <input
              type="checkbox"
              checked={watermarkEnabled}
              onChange={(e) => setWatermarkEnabled(e.target.checked)}
              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/50"
          >
            SAVE SECURITY SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
}
