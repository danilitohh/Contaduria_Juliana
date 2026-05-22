import { BriefcaseBusiness, UserRound } from "lucide-react";
import { ManagementPage } from "@/components/modules/management-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NominaPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
          <BriefcaseBusiness className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Nomina basica interna</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">Empleados, liquidaciones internas, novedades y comprobantes PDF.</p>
        </div>
      </div>
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Modulo interno. No implementa nomina electronica DIAN.
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-teal-700" />
            <h2 className="font-semibold text-slate-950">Empleados</h2>
          </div>
        </CardHeader>
        <CardContent>
          <ManagementPage moduleKey="empleados" compact />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-teal-700" />
            <h2 className="font-semibold text-slate-950">Liquidaciones</h2>
          </div>
        </CardHeader>
        <CardContent>
          <ManagementPage moduleKey="nomina" compact />
        </CardContent>
      </Card>
    </div>
  );
}
