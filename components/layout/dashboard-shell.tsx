import type { ReactNode } from "react";
import { DashboardWorkspace } from "@/components/layout/dashboard-workspace";

export function DashboardShell({ children }: { children: ReactNode }) {
  return <DashboardWorkspace>{children}</DashboardWorkspace>;
}
