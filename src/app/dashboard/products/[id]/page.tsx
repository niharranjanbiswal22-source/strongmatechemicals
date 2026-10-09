import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Layers, CheckCircle2, FileText, AlertTriangle } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Qlumate Products Catalog
      </Link>

      {/* Main Header Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-emerald-400 text-xs font-bold uppercase">
            {product.category}
          </span>
          <span className="text-xs text-slate-400 font-mono">SCPL Product Specs</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          {product.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {product.description}
        </p>

        {product.pdfUrl && (
          <div className="pt-2">
            <a
              href={product.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40"
            >
              <FileText className="w-4 h-4" /> Download Technical Data Sheet (TDS) PDF
            </a>
          </div>
        )}
      </div>

      {/* Technical Specifications Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Benefits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Key Features & Technical Benefits
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
            {product.keyBenefits}
          </div>
        </div>

        {/* Application Procedure */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-400" /> Site Application Procedure (SOP)
          </h3>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
            {product.applicationProcedure}
          </div>
        </div>

        {/* Mixing & Dosage */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white">Coverage, Mixing & Dosage</h3>
          <div className="space-y-2 text-xs">
            {product.coverage && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Standard Coverage:</span>
                <span className="text-white font-mono font-bold">{product.coverage}</span>
              </div>
            )}
            {product.mixingInstructions && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Mixing Instructions:</span>
                <span className="text-slate-200">{product.mixingInstructions}</span>
              </div>
            )}
            {product.dosage && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Recommended Dosage:</span>
                <span className="text-amber-400 font-mono font-bold">{product.dosage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Do's and Don'ts */}
        {product.dosAndDonts && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Do&apos;s and Don&apos;ts on Site
            </h3>
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-800">
              {product.dosAndDonts}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
