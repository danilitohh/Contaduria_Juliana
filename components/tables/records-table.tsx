"use client";

import { Download, FileDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTableValue, type ModuleDefinition } from "@/services/modules";

interface RecordsTableProps {
  config: ModuleDefinition;
  rows: Array<Record<string, unknown>>;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (row: Record<string, unknown>) => void;
  onPdf?: (row: Record<string, unknown>) => void;
}

export function RecordsTable({ config, rows, onEdit, onDelete, onDuplicate, onPdf }: RecordsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {config.columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)} className="bg-white hover:bg-slate-50">
                {config.columns.map((column) => (
                  <td key={column.key} className="max-w-[260px] px-4 py-3 text-slate-700">
                    {column.kind === "status" ? (
                      <Badge value={String(row[column.key] ?? "")} />
                    ) : (
                      <span className="line-clamp-2">{formatTableValue(row[column.key], column)}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {onEdit ? (
                      <Button size="icon" variant="ghost" aria-label="Editar registro" onClick={() => onEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onPdf ? (
                      <Button size="icon" variant="ghost" aria-label="Descargar PDF" onClick={() => onPdf(row)}>
                        <FileDown className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDuplicate && (row.numero || row.periodo) ? (
                      <Button size="icon" variant="ghost" aria-label="Duplicar registro" onClick={() => onDuplicate(row)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar registro"
                        onClick={() => onDelete(String(row.id))}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <div className="px-4 py-12 text-center text-sm text-slate-500">Sin registros para los filtros actuales.</div>
      ) : null}
    </div>
  );
}
