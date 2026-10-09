"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Award, Download, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";

interface CertificateCardProps {
  certificateId: string;
  learnerName: string;
  empId: string;
  courseTitle: string;
  issueDate: Date | string;
  qrCodeData: string;
}

export default function CertificateCard({
  certificateId,
  learnerName,
  empId,
  courseTitle,
  issueDate,
  qrCodeData,
}: CertificateCardProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [strongmateBase64, setStrongmateBase64] = useState<string>("");
  const [qlumateBase64, setQlumateBase64] = useState<string>("");

  useEffect(() => {
    // Generate QR Code
    QRCode.toDataURL(qrCodeData || `https://strongmatechemicals.com/verify-certificate?id=${certificateId}`, { width: 120 })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err));

    // Convert Logo PNGs to Base64 Data URL for jsPDF embedding
    const loadBase64 = async (url: string, callback: (base64: string) => void) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            callback(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Failed to convert image to base64", e);
      }
    };

    loadBase64("/images/strongmate-logo.png", setStrongmateBase64);
    loadBase64("/images/qlumate-logo.png", setQlumateBase64);
  }, [qrCodeData, certificateId]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Dark Corporate Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 210, "F");

    // Double Gold Frame
    doc.setDrawColor(217, 119, 6); // Gold border
    doc.setLineWidth(2);
    doc.rect(8, 8, 281, 194);
    doc.setLineWidth(0.6);
    doc.rect(12, 12, 273, 186);

    // Embed Logos in PDF Header
    if (strongmateBase64) {
      doc.addImage(strongmateBase64, "PNG", 20, 18, 55, 14);
    }
    if (qlumateBase64) {
      doc.addImage(qlumateBase64, "PNG", 220, 18, 55, 14);
    }

    // Header Text
    doc.setTextColor(220, 38, 38); // SCPL Red
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("STRONGMATE CHEMICALS PVT. LTD.", 148, 25, { align: "center" });

    doc.setTextColor(22, 163, 74); // Qlumate Green
    doc.setFontSize(12);
    doc.text("QLUMATE PRODUCT & APPLICATION ACADEMY", 148, 33, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("CERTIFICATE OF TRAINING COMPLETION", 148, 52, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(203, 213, 225);
    doc.text("This official certificate is proudly awarded to", 148, 65, { align: "center" });

    // Learner Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(251, 191, 36); // Amber Gold
    doc.text(learnerName.toUpperCase(), 148, 82, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(203, 213, 225);
    doc.text(`Employee ID: ${empId}`, 148, 92, { align: "center" });

    doc.text("for successfully completing 100% of required video lessons & passing assessments for", 148, 108, { align: "center" });

    // Course Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(34, 197, 94); // Emerald
    doc.text(courseTitle, 148, 122, { align: "center" });

    // Footer Metadata & Signatures
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Completion Date: ${formatDate(issueDate)}`, 25, 160);
    doc.text(`Certificate ID: ${certificateId}`, 25, 168);
    doc.text(`SCPL ISO 9001 Certified System`, 25, 176);

    doc.text("Sanjay Mohanty", 240, 160, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("Training Director • SCPL", 240, 168, { align: "center" });

    // QR Code
    if (qrUrl) {
      doc.addImage(qrUrl, "PNG", 133, 145, 32, 32);
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36);
      doc.text("SCAN TO VERIFY", 148, 182, { align: "center" });
    }

    doc.save(`SCPL-Certificate-${learnerName.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Printable Certificate Frame */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-600/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-white overflow-hidden">
        {/* Decorative Inner Frame */}
        <div className="absolute inset-3 border border-amber-500/30 rounded-2xl pointer-events-none"></div>

        {/* Certificate Header Logos */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-40 bg-white px-2.5 py-1.5 rounded-lg shadow border border-slate-700">
              <Image src="/images/strongmate-logo.png" alt="Strongmate Chemicals" fill className="object-contain p-1" />
            </div>
            <div className="relative h-12 w-36 bg-white px-2.5 py-1.5 rounded-lg shadow border border-slate-700">
              <Image src="/images/qlumate-logo.png" alt="Qlumate" fill className="object-contain p-1" />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4" /> Official SCPL Credential
            </div>
            <div className="text-xs font-mono text-slate-400">ID: {certificateId}</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Strongmate Chemicals Pvt. Ltd.
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide font-serif">
            CERTIFICATE OF TRAINING COMPLETION
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 italic">
            This official training completion certificate is awarded to
          </p>

          <div className="py-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 tracking-wider">
              {learnerName.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Employee ID: {empId}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            for successfully completing 100% of required video training lessons, field application procedures, safety SOPs, and passing the final assessment for:
          </p>

          <h3 className="text-lg sm:text-2xl font-bold text-emerald-400 max-w-xl mx-auto">
            {courseTitle}
          </h3>
        </div>

        {/* Certificate Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
          <div className="text-xs text-slate-400 space-y-1">
            <div>Completion Date: <strong className="text-white">{formatDate(issueDate)}</strong></div>
            <div>Issued by: <span className="text-slate-300 font-semibold">Strongmate R&D Training Division</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold">An ISO Certified Company</div>
          </div>

          {/* QR Code Verification */}
          {qrUrl && (
            <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <img src={qrUrl} alt="QR Code" className="w-14 h-14 bg-white p-1 rounded-lg" />
              <div className="text-[10px] text-slate-400 font-mono leading-tight">
                <div className="font-bold text-amber-400">SCAN TO VERIFY</div>
                <div>SCPL Verification Portal</div>
              </div>
            </div>
          )}

          <div className="text-right text-xs text-slate-400 border-t border-slate-700 pt-2 sm:border-t-0 sm:pt-0">
            <div className="font-bold text-slate-200">Sanjay Mohanty</div>
            <div className="text-[11px] text-slate-400">Training Director, SCPL</div>
          </div>
        </div>
      </div>

      {/* Export / Print Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleDownloadPDF}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-950/40 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download PDF Certificate
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
    </div>
  );
}
