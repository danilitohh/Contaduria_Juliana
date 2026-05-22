"use client";

export type DiagnosticLevel = "info" | "warning" | "error" | "process";

export interface DiagnosticEntry {
  id: string;
  level: DiagnosticLevel;
  title: string;
  detail?: string;
  route?: string;
  createdAt: string;
}

const storageKey = "nexo_diagnostics";
const maxEntries = 80;
const listeners = new Set<() => void>();

let entries: DiagnosticEntry[] = [];
let loaded = false;
let counter = 0;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadEntries() {
  if (loaded || !canUseStorage()) return;

  loaded = true;

  try {
    const stored = window.localStorage.getItem(storageKey);
    entries = stored ? (JSON.parse(stored) as DiagnosticEntry[]) : [];
  } catch {
    entries = [];
  }
}

function persistEntries() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    // Diagnostics should never break the app.
  }
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function compactValue(value: unknown) {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack ?? ""}`.trim();
  }

  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function addDiagnostic(entry: Omit<DiagnosticEntry, "id" | "createdAt" | "route"> & { route?: string }) {
  loadEntries();

  counter += 1;
  entries = [
    {
      ...entry,
      id: `${Date.now()}-${counter}`,
      route: entry.route ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
      createdAt: new Date().toISOString(),
    },
    ...entries,
  ].slice(0, maxEntries);

  persistEntries();
  emitChange();
}

export function addConsoleDiagnostic(level: DiagnosticLevel, title: string, values: unknown[]) {
  addDiagnostic({
    level,
    title,
    detail: values.map(compactValue).join("\n"),
  });
}

export function clearDiagnostics() {
  entries = [];
  persistEntries();
  emitChange();
}

export function getDiagnosticsSnapshot() {
  loadEntries();
  return entries;
}

export function subscribeDiagnostics(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function buildDiagnosticsReport(entriesToReport: DiagnosticEntry[]) {
  const lines = [
    "Nexo Admin - reporte de diagnostico",
    `Fecha: ${new Date().toISOString()}`,
    `URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}`,
    `User agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`,
    "",
    "Eventos recientes:",
  ];

  if (!entriesToReport.length) {
    lines.push("Sin eventos registrados.");
  }

  entriesToReport.forEach((entry, index) => {
    lines.push(
      "",
      `${index + 1}. [${entry.level.toUpperCase()}] ${entry.title}`,
      `Hora: ${entry.createdAt}`,
      `Ruta: ${entry.route ?? "N/A"}`,
    );

    if (entry.detail) {
      lines.push("Detalle:", entry.detail);
    }
  });

  return lines.join("\n");
}
