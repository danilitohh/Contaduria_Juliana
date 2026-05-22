"use client";

import { ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppSettings } from "@/hooks/use-app-settings";

export function ProfilePage() {
  const { company, profile } = useAppSettings();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Perfil</h1>
          <p className="mt-1 text-sm text-slate-500">Usuario, rol y empresa activa.</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-950">Usuario</h2>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Nombre</p>
              <p className="mt-1 font-semibold">{profile.nombre}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Correo</p>
              <p className="mt-1 font-semibold">{profile.email}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Rol</p>
              <div className="mt-2">
                <Badge value={profile.rol} />
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Separacion de datos</p>
              <p className="mt-1 font-mono text-xs">{profile.user_id}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-700" />
              <h2 className="font-semibold text-slate-950">Empresa</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-semibold text-slate-950">{company.nombre_empresa}</p>
            <p className="text-slate-500">{company.razon_social}</p>
            <p className="text-slate-500">NIT {company.nit}</p>
            <p className="text-slate-500">{company.identificacion}</p>
            <p className="text-slate-500">{company.email}</p>
            <p className="text-slate-500">
              {company.direccion}, {company.ciudad}
            </p>
            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Actividad economica</p>
              <p className="mt-1">{company.actividad_economica}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Responsabilidades fiscales</p>
              <p className="mt-1">{company.responsabilidades_fiscales}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800">Tributos</p>
              <p className="mt-1">{company.tributos}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
