"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Layers, Award, User, Users, Video, BarChart3, ShieldAlert } from "lucide-react";

interface MobileNavProps {
  role?: string;
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || role === "ADMIN";

  const learnerLinks = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Training", href: "/dashboard/courses", icon: BookOpen },
    { name: "Products", href: "/dashboard/products", icon: Layers },
    { name: "Certificates", href: "/dashboard/certificates", icon: Award },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const adminLinks = [
    { name: "Admin", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Videos", href: "/admin/videos", icon: Video },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Security", href: "/admin/security", icon: ShieldAlert },
  ];

  const links = isAdmin ? adminLinks : learnerLinks;

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 lg:hidden px-2 py-1.5 flex items-center justify-around text-slate-400 shadow-2xl">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/admin/dashboard" && pathname.startsWith(`${link.href}`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-all ${
              isActive ? "text-red-500 font-bold" : "hover:text-slate-200"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-slate-400"}`} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
