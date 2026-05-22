import { ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { companySettings, profile } from "@/services/mock-data";

export default function PerfilPage() {
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
            <p className="font-semibold text-slate-950">{companySettings.nombre_empresa}</p>
            <p className="text-slate-500">{companySettings.identificacion}</p>
            <p className="text-slate-500">{companySettings.email}</p>
            <p className="text-slate-500">{companySettings.direccion}, {companySettings.ciudad}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
