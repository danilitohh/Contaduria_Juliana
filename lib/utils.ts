import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

export function humanizeStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function statusTone(status: string) {
  if (["activo", "pagada", "pagado", "aceptada", "cerrada"].includes(status)) {
    return "success";
  }

  if (["pendiente", "enviada", "parcialmente_pagada", "abierta"].includes(status)) {
    return "warning";
  }

  if (["vencida", "vencido", "anulada", "rechazada", "inactivo"].includes(status)) {
    return "danger";
  }

  return "neutral";
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
}
