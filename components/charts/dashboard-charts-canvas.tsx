"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { expenseCategoryChart, salesChart } from "@/services/mock-data";

const currencyTick = (value: number) => `$${Math.round(value / 1000000)}M`;
const chartHeight = 320;

function MeasuredChart({ children }: { children: (width: number, height: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.max(320, Math.floor(entry.contentRect.width));
      setWidth((current) => (current === nextWidth ? current : nextWidth));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-80 min-w-0">
      {width > 0 ? children(width, chartHeight) : <div className="h-full rounded-md bg-slate-50" />}
    </div>
  );
}

export function DashboardChartsCanvas() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_.9fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-950">Ventas mensuales</h2>
          <p className="text-sm text-slate-500">Comparativo de ventas, gastos y utilidad.</p>
        </div>
        <MeasuredChart>
          {(width, height) => (
            <AreaChart width={width} height={height} data={salesChart} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="ventas" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gastos" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={currencyTick} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area type="monotone" dataKey="ventas" stroke="#0f766e" fill="url(#ventas)" strokeWidth={2} />
              <Area type="monotone" dataKey="gastos" stroke="#f59e0b" fill="url(#gastos)" strokeWidth={2} />
              <Area type="monotone" dataKey="utilidad" stroke="#1d4ed8" fill="#dbeafe" strokeWidth={2} />
            </AreaChart>
          )}
        </MeasuredChart>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-950">Gastos por categoria</h2>
          <p className="text-sm text-slate-500">Distribucion del periodo actual.</p>
        </div>
        <MeasuredChart>
          {(width, height) => (
            <BarChart width={width} height={height} data={expenseCategoryChart} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={currencyTick} tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </MeasuredChart>
      </section>
    </div>
  );
}
