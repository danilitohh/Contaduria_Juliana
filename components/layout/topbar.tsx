"use client";

import { Building2, Menu, Search, Settings, UserRound } from "lucide-react";
import { Input } from "@/components/ui/field";
import { clearSelectedCompany, useAppSettings } from "@/hooks/use-app-settings";
import { mainNavigation } from "@/services/modules";

export function Topbar() {
  const { company, profile } = useAppSettings();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label="Abrir navegacion"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar clientes, facturas, productos" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{company.nombre_empresa}</p>
            <p className="text-xs text-slate-500">{profile.nombre}</p>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
            aria-label="Cambiar empresa"
            onClick={clearSelectedCompany}
            title="Cambiar empresa"
          >
            <Building2 className="h-5 w-5" />
          </button>
          <a
            href="/configuracion"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
            aria-label="Configuracion"
          >
            <Settings className="h-5 w-5" />
          </a>
          <a
            href="/perfil"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50"
            aria-label="Perfil"
          >
            <UserRound className="h-5 w-5" />
          </a>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
