"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDiagnostic } from "@/components/diagnostics/diagnostics-store";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    addDiagnostic({
      level: "error",
      title: "Error renderizando pagina",
      detail: `${error.message}\nDigest: ${error.digest ?? "N/A"}\n${error.stack ?? ""}`,
    });
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
        <div>
          <h1 className="text-lg font-semibold">Algo fallo en esta pantalla</h1>
          <p className="mt-2 text-sm">
            Abre el boton de diagnostico en la parte superior, copia el reporte y compartelo para revisar la causa.
          </p>
          <Button className="mt-4" variant="danger" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
