import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import SessionTimeout from "@/components/SessionTimeout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/#login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={user.role} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mb-16 lg:mb-0 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileNav role={user.role} />
      <SessionTimeout />
    </div>
  );
}
