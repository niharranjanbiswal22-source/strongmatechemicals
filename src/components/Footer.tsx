import React from "react";
import Image from "next/image";
import { ShieldCheck, MapPin, Factory, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Summary */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-36 bg-white px-2 py-1 rounded shadow">
              <Image
                src="/images/strongmate-logo.png"
                alt="Strongmate Chemicals"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-9 w-32 bg-white px-2 py-1 rounded shadow">
              <Image
                src="/images/qlumate-logo.png"
                alt="Qlumate"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-300 max-w-lg">
            <strong>Strongmate Chemicals Pvt. Ltd. (SCPL)</strong> is a premier manufacturer of high-performance construction chemicals, waterproofing systems, tile adhesives, and surface finishing solutions under the <strong>Qlumate</strong> brand.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4" /> An ISO Certified Company
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-red-500" /> Protected Learning Portal
            </span>
          </div>
        </div>

        {/* Corporate Locations */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" /> Corporate HQ
          </h4>
          <p className="text-slate-300 font-semibold">Strongmate Chemicals Pvt. Ltd.</p>
          <p>Bhubaneswar, Odisha, India</p>
          <p className="text-[11px] text-slate-400 pt-1">Email: info@strongmatechemicals.com</p>
        </div>

        {/* Manufacturing Locations */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Factory className="w-4 h-4 text-amber-500" /> Plants & Units
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Balasore Unit, Odisha</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Udaipur Unit, Rajasthan</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © {new Date().getFullYear()} Strongmate Chemicals Pvt. Ltd. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Confidential Joiner Portal</span>
          <span>•</span>
          <span>Security Architecture: DRM + Watermark + Audit</span>
        </div>
      </div>
    </footer>
  );
}
