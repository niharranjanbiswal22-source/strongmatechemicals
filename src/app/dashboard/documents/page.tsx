import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FileText, Download, Eye, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const documents = await db.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { course: true },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-400" /> Documents & Technical Data Sheets (TDS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Official application guides, SOPs, product brochures, and Material Safety Data Sheets (MSDS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                {doc.category}
              </span>
              <h3 className="text-sm font-bold text-white pt-1">{doc.title}</h3>
              {doc.course && (
                <p className="text-xs text-slate-400">Course: {doc.course.title}</p>
              )}
              <span className="text-[10px] text-slate-500 block">{formatDate(doc.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {doc.isDownloadable ? (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Download
                </a>
              ) : (
                <span className="px-3.5 py-2 bg-slate-950 text-slate-400 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> View Only
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
