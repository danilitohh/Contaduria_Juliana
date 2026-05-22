"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { formatCurrency, toCsv } from "@/lib/utils";
import { clients, dashboardSummary, expenses, invoices, products } from "@/services/mock-data";

export function ReportsPage() {
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(
    () =>
      invoices
        .filter((invoice) => !clientId || invoice.client_id === clientId)
        .filter((invoice) => !status || invoice.estado === status)
        .map((invoice) => ({
          numero: invoice.numero,
          cliente: invoice.client_name,
          fecha: invoice.fecha,
          estado: invoice.estado,
          total: invoice.total,
          saldo: invoice.saldo_pendiente,
        })),
    [clientId, status],
  );

  function exportCsv() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexo-admin-reporte.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Reportes</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">Ventas, gastos, utilidad, cartera, inventario y exportaciones.</p>
            </div>
          </div>
        </div>
        <Button onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Ventas totales</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(invoices.reduce((sum, row) => sum + row.total, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Gastos totales</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(expenses.reduce((sum, row) => sum + row.total, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Inventario valorizado</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(dashboardSummary.inventoryValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Stock bajo</p>
            <p className="mt-2 text-2xl font-semibold">{products.filter((row) => row.tipo === "producto" && row.stock_actual <= row.stock_minimo).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 md:grid-cols-4">
            <Input type="date" defaultValue="2026-05-01" />
            <Input type="date" defaultValue="2026-05-31" />
            <Select value={clientId} onChange={(event) => setClientId(event.target.value)}>
              <option value="">Cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </Select>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Estado</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="pagada">Pagada</option>
              <option value="parcialmente_pagada">Parcial</option>
              <option value="vencida">Vencida</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Numero</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.numero}>
                    <td className="px-4 py-3">{row.numero}</td>
                    <td className="px-4 py-3">{row.cliente}</td>
                    <td className="px-4 py-3">{row.fecha}</td>
                    <td className="px-4 py-3">{row.estado}</td>
                    <td className="px-4 py-3">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DashboardCharts />
    </div>
  );
}
