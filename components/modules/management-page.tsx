"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useForm, type FieldValues, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/field";
import { RecordsTable } from "@/components/tables/records-table";
import { cn } from "@/lib/utils";
import {
  downloadInvoicePdf,
  downloadPayrollPdf,
  downloadQuotePdf,
  downloadReceiptPdf,
} from "@/lib/pdf/templates";
import { useAppSettings } from "@/hooks/use-app-settings";
import { employees } from "@/services/mock-data";
import { moduleRegistry, type FormField, type ModuleKey } from "@/services/modules";
import type { Invoice, Payment, Payroll, Quote } from "@/types/business";

interface ManagementPageProps {
  moduleKey: ModuleKey;
  compact?: boolean;
}

const DEMO_DATE = "2026-05-21";
const DEMO_TIMESTAMP = "2026-05-21T09:00:00.000Z";

function createDefaultValues(fields: FormField[]) {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.type === "number") return [field.name, 0];
      if (field.type === "date") return [field.name, DEMO_DATE];
      if (field.type === "select") return [field.name, field.options?.[0] ?? ""];
      return [field.name, ""];
    }),
  );
}

function matchesSearch(row: Record<string, unknown>, keys: string[], query: string) {
  if (!query.trim()) return true;
  const normalized = query.toLowerCase();
  return keys.some((key) => String(row[key] ?? "").toLowerCase().includes(normalized));
}

function renderField(field: FormField, register: UseFormRegister<FieldValues>) {
  const common = {
    id: field.name,
    placeholder: field.placeholder,
    ...register(field.name, { valueAsNumber: field.type === "number" }),
  };

  if (field.type === "select") {
    return (
      <Select {...common}>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === "textarea") {
    return <Textarea {...common} />;
  }

  return <Input type={field.type} {...common} />;
}

export function ManagementPage({ moduleKey, compact = false }: ManagementPageProps) {
  const config = moduleRegistry[moduleKey];
  const { company } = useAppSettings();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>(() =>
    config.rows.map((row) => row as Record<string, unknown>),
  );
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const defaults = useMemo(() => createDefaultValues(config.formFields), [config.formFields]);
  const form = useForm<FieldValues>({
    resolver: config.formSchema ? zodResolver(config.formSchema as never) : undefined,
    defaultValues: defaults,
  });

  const filteredRows = rows.filter((row) => {
    const searchOk = matchesSearch(row, config.searchKeys, query);
    const filtersOk = config.filters.every((filter) => {
      const selected = filterValues[filter.key];
      return !selected || String(row[filter.key] ?? "") === selected;
    });

    return searchOk && filtersOk;
  });

  function submit(values: Record<string, unknown>) {
    setRows((current) => [
      {
        ...values,
        id: `${config.key}-${current.length + 1}`,
        user_id: "demo-user",
        created_at: DEMO_TIMESTAMP,
        updated_at: DEMO_TIMESTAMP,
      },
      ...current,
    ]);
    form.reset(defaults);
    setShowForm(false);
  }

  function duplicate(row: Record<string, unknown>) {
    const label = row.numero ? `${row.numero}-COPIA` : row.periodo ? `${row.periodo}-COPIA` : row.id;
    setRows((current) => {
      const copyIndex = current.filter((item) => String(item.id).startsWith(String(row.id))).length + 1;
      return [
        {
          ...row,
          id: `${String(row.id)}-copy-${copyIndex}`,
          numero: row.numero ? label : row.numero,
          periodo: row.periodo && !row.numero ? label : row.periodo,
          estado: "borrador",
          created_at: DEMO_TIMESTAMP,
          updated_at: DEMO_TIMESTAMP,
        },
        ...current,
      ];
    });
  }

  function downloadPdf(row: Record<string, unknown>) {
    if (config.pdf === "quote") downloadQuotePdf(company, row as unknown as Quote);
    if (config.pdf === "invoice") downloadInvoicePdf(company, row as unknown as Invoice);
    if (config.pdf === "receipt") downloadReceiptPdf(company, row as unknown as Payment);
    if (config.pdf === "payroll") {
      const payroll = row as unknown as Payroll;
      const employee = employees.find((item) => item.id === payroll.empleado_id);
      downloadPayrollPdf(company, payroll, employee);
    }
  }

  const Icon = config.icon;

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {!compact ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{config.title}</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-500">{config.subtitle}</p>
              </div>
            </div>
            {config.notice ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {config.notice}
              </div>
            ) : null}
          </div>
          {config.formFields.length ? (
            <Button onClick={() => setShowForm((value) => !value)}>
              <Plus className="h-4 w-4" />
              {config.createLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        {config.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && config.formFields.length ? (
        <Card>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={form.handleSubmit(submit)}>
              {config.formFields.map((field) => {
                const error = form.formState.errors[field.name]?.message;
                return (
                  <label key={field.name} className="space-y-2 text-sm font-medium text-slate-700">
                    {field.label}
                    {renderField(field, form.register)}
                    {error ? <span className="block text-xs text-red-600">{String(error)}</span> : null}
                  </label>
                );
              })}
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
                <Button type="submit">Guardar</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {config.filters.map((filter) => (
                <label key={filter.key} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <SlidersHorizontal className="h-4 w-4" />
                  <Select
                    className="h-9 min-w-40"
                    value={filterValues[filter.key] ?? ""}
                    onChange={(event) =>
                      setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                    }
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
              ))}
            </div>
          </div>

          <RecordsTable
            config={config}
            rows={filteredRows}
            onDelete={(id) => setRows((current) => current.filter((row) => String(row.id) !== id))}
            onDuplicate={duplicate}
            onPdf={config.pdf ? downloadPdf : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
