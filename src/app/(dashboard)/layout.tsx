"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/components/providers/auth-provider";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthedAdmin = Boolean(user && user.role === "ADMIN");

  useEffect(() => {
    if (!isLoading && !isAuthedAdmin) {
      router.replace("/login");
    }
  }, [isLoading, isAuthedAdmin, router]);

  // Keep showing the spinner while loading OR while redirecting — no blank flash.
  if (isLoading || !isAuthedAdmin) {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <Sidebar className="sticky top-0 hidden h-screen lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
