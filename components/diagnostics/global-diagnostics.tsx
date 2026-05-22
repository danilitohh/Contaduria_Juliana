import { DiagnosticsCenter } from "@/components/diagnostics/diagnostics-center";

export function GlobalDiagnostics() {
  return (
    <div className="fixed bottom-5 right-5 z-[80] print:hidden">
      <DiagnosticsCenter label="Diagnostico" panelPlacement="above" variant="dark" />
    </div>
  );
}
