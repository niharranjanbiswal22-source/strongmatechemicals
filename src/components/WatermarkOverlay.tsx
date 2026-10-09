"use client";

import React, { useEffect, useState } from "react";

interface WatermarkOverlayProps {
  empName: string;
  empId: string;
  sessionId?: string;
  ipAddress?: string;
}

export default function WatermarkOverlay({
  empName,
  empId,
  sessionId = "SMC-SESSION",
  ipAddress = "103.211.14.88",
}: WatermarkOverlayProps) {
  const [position, setPosition] = useState({ top: 20, left: 20 });

  useEffect(() => {
    // Change watermark position every 25 seconds
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65) + 15; // 15% to 80%
      const randomLeft = Math.floor(Math.random() * 60) + 10; // 10% to 70%
      setPosition({ top: randomTop, left: randomLeft });
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-30">
      {/* Moving Main Watermark Badge */}
      <div
        className="absolute transition-all duration-1000 ease-in-out bg-black/40 backdrop-blur-[1px] border border-red-500/30 text-white text-[11px] md:text-xs font-mono px-3 py-1.5 rounded-md shadow-2xl space-y-0.5 opacity-60 leading-tight border-l-4 border-l-red-600"
        style={{
          top: `${position.top}%`,
          left: `${position.left}%`,
        }}
      >
        <div className="font-bold text-red-400 tracking-wider flex items-center gap-1.5 uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          CONFIDENTIAL • STRONGMATE CHEMICALS
        </div>
        <div className="text-gray-200">
          Learner: <span className="font-semibold text-white">{empName}</span> ({empId})
        </div>
        <div className="text-gray-400 text-[10px] flex items-center gap-2">
          <span>SESS: {sessionId.substring(0, 10)}</span>
          <span>•</span>
          <span>IP: {ipAddress}</span>
        </div>
      </div>

      {/* Subtle Static Background Watermark Grid */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-8 p-6 opacity-[0.08] text-white font-mono text-[10px] uppercase pointer-events-none font-bold">
        <div>CONFIDENTIAL - SCPL - {empId}</div>
        <div className="hidden md:block">STRONGMATE CHEMICALS - {empName}</div>
        <div>QLUMATE TRAINING - {empId}</div>
        <div>CONFIDENTIAL - SCPL - {empId}</div>
        <div className="hidden md:block">DO NOT RECORD OR DISTRIBUTE</div>
        <div>STRONGMATE CHEMICALS - {empId}</div>
      </div>
    </div>
  );
}
