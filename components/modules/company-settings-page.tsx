"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Palette } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { companySchema } from "@/lib/validations/schemas";
import { companySettings } from "@/services/mock-data";

export function CompanySettingsPage() {
  const [saved, setSaved] = useState(false);
  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: companySettings,
  });

  function submit() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Configuracion</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">Empresa, consecutivos, impuestos, textos legales y apariencia de PDFs.</p>
        </div>
      </div>

      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Configuracion guardada en modo demo.
        </div>
      ) : null}

      <form className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={form.handleSubmit(submit)}>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-950">Datos de empresa</h2>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Nombre empresa
              <Input {...form.register("nombre_empresa")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Identificacion
              <Input {...form.register("identificacion")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Correo
              <Input type="email" {...form.register("email")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Telefono
              <Input {...form.register("telefono")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Direccion
              <Input {...form.register("direccion")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Ciudad
              <Input {...form.register("ciudad")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Pais
              <Input {...form.register("pais")} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Moneda
              <Input {...form.register("moneda")} />
            </label>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-950">Consecutivos</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Prefijo factura
                <Input {...form.register("prefijo_factura")} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Consecutivo factura
                <Input type="number" {...form.register("consecutivo_factura", { valueAsNumber: true })} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Prefijo cotizacion
                <Input {...form.register("prefijo_cotizacion")} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Consecutivo cotizacion
                <Input type="number" {...form.register("consecutivo_cotizacion", { valueAsNumber: true })} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-teal-700" />
                <h2 className="font-semibold text-slate-950">PDF</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Impuesto por defecto
                <Input type="number" {...form.register("impuesto_default", { valueAsNumber: true })} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Color marca
                <Input type="color" className="h-12 p-1" {...form.register("color_marca")} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Terminos
                <Textarea {...form.register("terminos_default")} />
              </label>
              <Button type="submit" className="w-full">Guardar cambios</Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
