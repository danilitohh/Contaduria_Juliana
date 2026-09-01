import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { getAdminEmail } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const adminEmail = getAdminEmail();

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">Ingresar</h1>
          <p className="mt-2 text-sm text-slate-500">
            Acceso privado habilitado solo para la cuenta autorizada.
          </p>
        </div>

        {error === "credentials" ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            Correo, usuario o contrasena incorrectos.
          </div>
        ) : null}
        {error === "config" ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Falta configurar la sesion privada en las variables de entorno.
          </div>
        ) : null}

        <form action="/api/auth/login" method="post" className="space-y-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Correo o usuario
            <Input
              type="text"
              name="identifier"
              defaultValue={adminEmail}
              autoComplete="username"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Contrasena
            <Input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
          >
            Entrar
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          No se pueden crear nuevas cuentas.{" "}
          <Link className="font-semibold text-teal-700" href="/register">
            Ver estado del registro
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
