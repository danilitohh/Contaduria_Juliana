import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/field";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Registro</h1>
          <p className="mt-2 text-sm text-slate-500">Crea la empresa y el usuario propietario.</p>
        </div>
        <div className="space-y-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nombre empresa
            <Input defaultValue="Nexo Admin Studio" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Nombre usuario
            <Input defaultValue="Juliana Herrera" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Correo
            <Input type="email" defaultValue="admin@nexoadmin.local" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Contrasena
            <Input type="password" defaultValue="demo1234" />
          </label>
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
          >
            Crear cuenta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-center text-sm text-slate-500">
          Ya tienes cuenta?{" "}
          <Link className="font-semibold text-teal-700" href="/login">
            Ingresar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
