import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Layers, ArrowRight, CheckCircle2, FileText } from "lucide-react";

export default async function ProductAcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const filterCategory = params.category;

  const whereClause = filterCategory ? { category: filterCategory } : {};

  const products = await db.product.findMany({
    where: whereClause,
    orderBy: { category: "asc" },
  });

  const categories = [
    "All",
    "Waterproofing",
    "Concrete Admixtures",
    "Wall Finishing",
    "Tile Fixing",
    "Cool Coating",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Layers className="w-4 h-4" /> Strongmate Technical Center
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          QLUMATE PRODUCT ACADEMY
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Comprehensive product catalog, technical specifications, mixing ratios, application procedures, dosage guidelines, and TDS documents for field application executives.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          {categories.map((cat) => {
            const isActive = (cat === "All" && !filterCategory) || filterCategory === cat;

            return (
              <Link
                key={cat}
                href={cat === "All" ? "/dashboard/products" : `/dashboard/products?category=${encodeURIComponent(cat)}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded text-emerald-400 text-xs font-bold">
                  {product.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {product.coverage && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                  Coverage: <strong className="text-white">{product.coverage}</strong>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <span>VIEW TECHNICAL DETAILS & SOPS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
