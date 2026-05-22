"use client";

import type { ReactNode } from "react";
import { CompanySelectorPage } from "@/components/modules/company-selector-page";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAppSettings } from "@/hooks/use-app-settings";

export function DashboardWorkspace({ children }: { children: ReactNode }) {
  const { companies, selectedCompanyId } = useAppSettings();
  const selectedCompanyExists = Boolean(selectedCompanyId && companies.some((company) => company.id === selectedCompanyId));

  if (!selectedCompanyExists) {
    return <CompanySelectorPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
