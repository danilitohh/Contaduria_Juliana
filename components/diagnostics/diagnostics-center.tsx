"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clipboard,
  Info,
  ListRestart,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  addConsoleDiagnostic,
  addDiagnostic,
  buildDiagnosticsReport,
  clearDiagnostics,
  getDiagnosticsSnapshot,
  subscribeDiagnostics,
  type DiagnosticEntry,
  type DiagnosticLevel,
} from "@/components/diagnostics/diagnostics-store";
import { cn, formatDate } from "@/lib/utils";

let listenersInstalled = false;

function levelIcon(level: DiagnosticLevel) {
  if (level === "error") return AlertTriangle;
  if (level === "warning") return AlertTriangle;
  if (level === "process") return ListRestart;
  return Info;
}

function levelClass(level: DiagnosticLevel) {
  if (level === "error") return "border-red-200 bg-red-50 text-red-700";
  if (level === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (level === "process") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function entryTime(entry: DiagnosticEntry) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(entry.createdAt));
}

function installDiagnosticsListeners() {
  if (listenersInstalled || typeof window === "undefined") return;

  listenersInstalled = true;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...values: unknown[]) => {
    originalError(...values);
    addConsoleDiagnostic("error", "console.error", values);
  };

  console.warn = (...values: unknown[]) => {
    originalWarn(...values);
    addConsoleDiagnostic("warning", "console.warn", values);
  };

  window.addEventListener("error", (event) => {
    addDiagnostic({
      level: "error",
      title: "Error de JavaScript",
      detail: `${event.message}\n${event.filename}:${event.lineno}:${event.colno}`,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.stack ?? event.reason.message : String(event.reason);
    addDiagnostic({
      level: "error",
      title: "Promesa rechazada sin manejar",
      detail: reason,
    });
  });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const action = target.closest("a,button");
      if (!action) return;

      const label = action.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) || action.getAttribute("aria-label") || "Sin etiqueta";
      const href = action instanceof HTMLAnchorElement ? action.href : undefined;

      addDiagnostic({
        level: "process",
        title: `Click: ${label}`,
        detail: href ? `Destino: ${href}` : undefined,
      });
    },
    true,
  );

  addDiagnostic({
    level: "info",
    title: "Centro de diagnostico activo",
    detail: "Se estan registrando errores, advertencias, clicks y cambios de ruta.",
  });
}

export function DiagnosticsCenter({
  label,
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "dark";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const entries = useSyncExternalStore(subscribeDiagnostics, getDiagnosticsSnapshot, () => []);

  useEffect(() => {
    installDiagnosticsListeners();
  }, []);

  useEffect(() => {
    window.setTimeout(() => {
      addDiagnostic({
        level: "process",
        title: "Ruta abierta",
        detail: pathname,
        route: pathname,
      });
    }, 0);
  }, [pathname]);

  const errorCount = useMemo(
    () => entries.filter((entry) => entry.level === "error" || entry.level === "warning").length,
    [entries],
  );

  async function copyReport() {
    const report = buildDiagnosticsReport(entries);

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      addDiagnostic({
        level: "info",
        title: "Reporte copiado",
        detail: "El reporte de diagnostico fue copiado al portapapeles.",
      });
    } catch {
      addDiagnostic({
        level: "warning",
        title: "No se pudo copiar automaticamente",
        detail: report,
      });
    }
  }

  return (
    <div className="relative">
      <button
        className={cn(
          "relative inline-flex h-9 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium transition",
          label ? "w-auto" : "w-9",
          variant === "dark"
            ? "border border-white/10 bg-white/10 text-white hover:bg-white/15"
            : "text-slate-700 hover:bg-slate-100",
        )}
        aria-label="Centro de diagnostico"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {label ? <span>{label}</span> : null}
        {errorCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {Math.min(errorCount, 9)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,520px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-950">Diagnostico</h2>
                {errorCount > 0 ? <Badge value={`${errorCount} alertas`} /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Copia este reporte cuando algo falle y compartelo aqui.
              </p>
            </div>
            <button
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar diagnostico"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-700 px-3 text-sm font-medium text-white transition hover:bg-teal-800"
              onClick={copyReport}
            >
              <Clipboard className="h-4 w-4" />
              {copied ? "Copiado" : "Copiar reporte"}
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={clearDiagnostics}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          </div>

          <div className="max-h-[440px] overflow-y-auto p-3">
            {entries.length ? (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const Icon = levelIcon(entry.level);
                  return (
                    <article
                      key={entry.id}
                      className={cn("rounded-md border p-3 text-sm", levelClass(entry.level))}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{entry.title}</p>
                            <span className="font-mono text-[11px] opacity-75">{entryTime(entry)}</span>
                          </div>
                          <p className="mt-1 font-mono text-[11px] opacity-75">
                            {entry.route ?? "sin ruta"} | {formatDate(entry.createdAt)}
                          </p>
                          {entry.detail ? (
                            <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-white/70 p-2 font-mono text-[11px] leading-5 text-slate-700">
                              {entry.detail}
                            </pre>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No hay eventos registrados todavia.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
