"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNavigation } from "@/services/modules";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-800/60 bg-slate-950 text-white lg:sticky lg:top-0 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 text-slate-950">
            <Network className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold">Nexo Admin</p>
            <p className="text-xs text-slate-400">Gestion integral</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {mainNavigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                  active && "bg-teal-500 text-slate-950 hover:bg-teal-500 hover:text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/api/auth/logout"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Link>
        </div>
      </div>
    </aside>
  );
}
