"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Plus, CheckCircle2, ShieldCheck, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AccessCodeItem {
  id: string;
  code: string;
  description: string;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  status: string;
  createdAt: string;
}

export default function AdminAccessCodesPage() {
  const [accessCodes, setAccessCodes] = useState<AccessCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAtDays, setExpiresAtDays] = useState(90);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/access-codes");
      const data = await res.json();
      if (data.accessCodes) setAccessCodes(data.accessCodes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code || `SMC-TRAIN-${Math.floor(2026 + Math.random() * 100)}`,
          description,
          maxUses,
          expiresAtDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create access code");
      }

      setCode("");
      setDescription("");
      fetchAccessCodes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-amber-500" /> Training Access Code Generator
        </h1>
        <p className="text-xs text-slate-400">
          Generate special batch access codes for new employees, sales trainees, dealer staff, or field technicians.
        </p>
      </div>

      {/* Access Code Creation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Create New Training Access Code</h3>

        {error && (
          <div className="p-3 bg-red-950 border border-red-800 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Access Code String</label>
            <input
              type="text"
              placeholder="e.g. SMC-TRAIN-2026"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Description / Target Group</label>
            <input
              type="text"
              placeholder="e.g. Odisha Dealer Batch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Max Users Limit</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition shadow"
            >
              {saving ? "Generating..." : "Generate Code"}
            </button>
          </div>
        </form>
      </div>

      {/* Access Codes List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Access Code</th>
                <th className="p-4">Description</th>
                <th className="p-4">Used Count / Max</th>
                <th className="p-4">Expires On</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {accessCodes.map((ac) => (
                <tr key={ac.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-amber-400 text-sm flex items-center gap-2">
                    <span>{ac.code}</span>
                  </td>
                  <td className="p-4 text-slate-300">{ac.description}</td>
                  <td className="p-4 font-mono">
                    <strong className="text-white">{ac.usedCount}</strong> / {ac.maxUses}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{formatDate(ac.expiresAt)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                      {ac.status}
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
