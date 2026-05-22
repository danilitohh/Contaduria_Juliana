import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Package, ReceiptText } from "lucide-react";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  dashboardMetrics,
  dashboardSummary,
  invoices,
  quotes,
} from "@/services/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Operacion empresarial</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Ventas, cartera, inventario, gastos y alertas internas para tomar decisiones rapidas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cotizaciones"
            prefetch={false}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <FileText className="h-4 w-4" />
            Cotizar
          </Link>
          <Link
            href="/pos"
            prefetch={false}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
          >
            <ReceiptText className="h-4 w-4" />
            Vender
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
                </div>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                  {metric.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <DashboardCharts />
        <Card className="xl:row-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-950">Alertas</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardSummary.alerts.map((alert) => (
              <div key={alert} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {alert}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Clientes activos</p>
                <p className="mt-1 text-xl font-semibold">{dashboardSummary.activeClients}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Inventario</p>
                <p className="mt-1 text-xl font-semibold">{formatCurrency(dashboardSummary.inventoryValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Ultimas facturas</h2>
              <Link className="text-sm font-medium text-teal-700" href="/facturas">
                Ver
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.slice(0, 4).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 p-3">
                <div>
                  <p className="font-medium text-slate-900">{invoice.numero}</p>
                  <p className="text-xs text-slate-500">{invoice.client_name} | {formatDate(invoice.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                  <Badge value={invoice.estado} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Ultimas cotizaciones</h2>
              <Link className="text-sm font-medium text-teal-700" href="/cotizaciones">
                Ver
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotes.slice(0, 4).map((quote) => (
              <div key={quote.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 p-3">
                <div>
                  <p className="font-medium text-slate-900">{quote.numero}</p>
                  <p className="text-xs text-slate-500">{quote.client_name} | {formatDate(quote.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(quote.total)}</p>
                  <Badge value={quote.estado} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-semibold text-slate-950">Bajo stock</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardSummary.lowStockProducts.map((product) => (
              <Link
                key={product.id}
                href="/productos"
                prefetch={false}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 p-3 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{product.nombre}</p>
                  <p className="text-xs text-slate-500">{product.sku}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  {product.stock_actual}/{product.stock_minimo}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
