import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Registro deshabilitado</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nexo Admin esta configurado para una unica cuenta autorizada. No se pueden crear usuarios adicionales desde esta pagina.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
        >
          Volver al ingreso
        </Link>
      </CardContent>
    </Card>
  );
}
