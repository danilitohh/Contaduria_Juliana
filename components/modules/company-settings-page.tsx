"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Palette, RotateCcw, Save, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/field";
import { addDiagnostic } from "@/components/diagnostics/diagnostics-store";
import { resetAppSettings, saveAppSettings, useAppSettings } from "@/hooks/use-app-settings";
import { appSettingsSchema, type AppSettingsFormValues } from "@/lib/validations/schemas";

function errorText(message: unknown) {
  return message ? <span className="block text-xs text-red-600">{String(message)}</span> : null;
}

export function CompanySettingsPage() {
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const settings = useAppSettings();
  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(appSettingsSchema) as never,
    defaultValues: {
      company: settings.company,
      profile: settings.profile,
    },
  });

  useEffect(() => {
    form.reset({
      company: settings.company,
      profile: settings.profile,
    });
  }, [form, settings]);

  function notifySaved(kind: "saved" | "restored") {
    setSaved(kind === "saved");
    setRestored(kind === "restored");
    window.setTimeout(() => {
      setSaved(false);
      setRestored(false);
    }, 2400);
  }

  function submit(values: AppSettingsFormValues) {
    const nextSettings = saveAppSettings({
      company: {
        ...settings.company,
        ...values.company,
      },
      profile: {
        ...settings.profile,
        ...values.profile,
      },
    });

    form.reset({
      company: nextSettings.company,
      profile: nextSettings.profile,
    });

    addDiagnostic({
      level: "info",
      title: "Configuracion guardada",
      detail: `${nextSettings.company.nombre_empresa} | ${nextSettings.profile.nombre}`,
    });

    notifySaved("saved");
  }

  function restoreDemoSettings() {
    const nextSettings = resetAppSettings();
    form.reset({
      company: nextSettings.company,
      profile: nextSettings.profile,
    });

    addDiagnostic({
      level: "info",
      title: "Configuracion restaurada",
      detail: "Se restauraron los datos demo.",
    });

    notifySaved("restored");
  }

  const errors = form.formState.errors;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Configuracion</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">Empresa, usuario, consecutivos, impuestos, textos legales y apariencia de PDFs.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={restoreDemoSettings}>
            <RotateCcw className="h-4 w-4" />
            Restaurar demo
          </Button>
          <Button type="submit" form="company-settings-form">
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </div>

      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Configuracion guardada.
        </div>
      ) : null}

      {restored ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
          Datos demo restaurados.
        </div>
      ) : null}

      <form id="company-settings-form" className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-teal-700" />
                <h2 className="font-semibold text-slate-950">Usuario</h2>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-1">
                Nombre usuario
                <Input {...form.register("profile.nombre")} />
                {errorText(errors.profile?.nombre?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-1">
                Correo usuario
                <Input type="email" {...form.register("profile.email")} />
                {errorText(errors.profile?.email?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-1">
                Rol
                <Select {...form.register("profile.rol")}>
                  <option value="propietario">Propietario</option>
                  <option value="administrador">Administrador</option>
                  <option value="operador">Operador</option>
                </Select>
                {errorText(errors.profile?.rol?.message)}
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-950">Datos de empresa</h2>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Nombre empresa
                <Input {...form.register("company.nombre_empresa")} />
                {errorText(errors.company?.nombre_empresa?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Identificacion
                <Input {...form.register("company.identificacion")} />
                {errorText(errors.company?.identificacion?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Correo
                <Input type="email" {...form.register("company.email")} />
                {errorText(errors.company?.email?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Telefono
                <Input {...form.register("company.telefono")} />
                {errorText(errors.company?.telefono?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Direccion
                <Input {...form.register("company.direccion")} />
                {errorText(errors.company?.direccion?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Ciudad
                <Input {...form.register("company.ciudad")} />
                {errorText(errors.company?.ciudad?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Pais
                <Input {...form.register("company.pais")} />
                {errorText(errors.company?.pais?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Moneda
                <Input {...form.register("company.moneda")} />
                {errorText(errors.company?.moneda?.message)}
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-950">Consecutivos</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Prefijo factura
                <Input {...form.register("company.prefijo_factura")} />
                {errorText(errors.company?.prefijo_factura?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Consecutivo factura
                <Input type="number" {...form.register("company.consecutivo_factura", { valueAsNumber: true })} />
                {errorText(errors.company?.consecutivo_factura?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Prefijo cotizacion
                <Input {...form.register("company.prefijo_cotizacion")} />
                {errorText(errors.company?.prefijo_cotizacion?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Consecutivo cotizacion
                <Input type="number" {...form.register("company.consecutivo_cotizacion", { valueAsNumber: true })} />
                {errorText(errors.company?.consecutivo_cotizacion?.message)}
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
                <Input type="number" {...form.register("company.impuesto_default", { valueAsNumber: true })} />
                {errorText(errors.company?.impuesto_default?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Color marca
                <Input type="color" className="h-12 p-1" {...form.register("company.color_marca")} />
                {errorText(errors.company?.color_marca?.message)}
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Terminos
                <Textarea {...form.register("company.terminos_default")} />
                {errorText(errors.company?.terminos_default?.message)}
              </label>
              <Button type="submit" className="w-full">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
