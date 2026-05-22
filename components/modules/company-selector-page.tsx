"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, LogOut, Network, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/field";
import { addDiagnostic } from "@/components/diagnostics/diagnostics-store";
import { createCompany, selectCompany, useAppSettings } from "@/hooks/use-app-settings";
import { companyRegistrationSchema, type CompanyRegistrationFormValues } from "@/lib/validations/schemas";
import type { CompanySettings } from "@/types/business";

const now = "2026-05-21T09:00:00.000Z";

function errorText(message: unknown) {
  return message ? <span className="block text-xs text-red-600">{String(message)}</span> : null;
}

function createCompanyRecord(values: CompanyRegistrationFormValues, userId: string): CompanySettings {
  const createdAt = new Date().toISOString();

  return {
    id: `company-${Date.now()}`,
    user_id: userId,
    nombre_empresa: values.nombre_empresa,
    nit: values.nit,
    razon_social: values.razon_social,
    tipo_razon_social: values.tipo_razon_social,
    tipo_identificacion: values.tipo_identificacion,
    identificacion: `${values.tipo_identificacion} ${values.identificacion}-${values.digito_verificacion}`,
    digito_verificacion: values.digito_verificacion,
    email: values.email,
    telefono: "+57 300 000 0000",
    direccion: "Sin direccion registrada",
    ciudad: "Bogota",
    pais: "Colombia",
    actividad_economica: values.actividad_economica,
    responsabilidades_fiscales: values.responsabilidades_fiscales,
    tributos: values.tributos,
    moneda: "COP",
    impuesto_default: 19,
    prefijo_factura: "NI",
    consecutivo_factura: 1,
    prefijo_cotizacion: "CT",
    consecutivo_cotizacion: 1,
    terminos_default: "Validez de 15 dias. Los precios pueden variar segun disponibilidad y alcance final aprobado.",
    color_marca: "#0f766e",
    created_at: createdAt || now,
    updated_at: createdAt || now,
  };
}

export function CompanySelectorPage() {
  const settings = useAppSettings();
  const [showForm, setShowForm] = useState(settings.companies.length === 0);
  const defaults = useMemo<CompanyRegistrationFormValues>(
    () => ({
      nit: "",
      nombre_empresa: "",
      email: "",
      razon_social: "",
      tipo_razon_social: "Sociedad por acciones simplificada",
      tipo_identificacion: "NIT",
      identificacion: "",
      digito_verificacion: "",
      actividad_economica: "",
      responsabilidades_fiscales: "",
      tributos: "",
    }),
    [],
  );
  const form = useForm<CompanyRegistrationFormValues>({
    resolver: zodResolver(companyRegistrationSchema) as never,
    defaultValues: defaults,
  });

  function enterCompany(companyId: string) {
    const nextSettings = selectCompany(companyId);

    addDiagnostic({
      level: "info",
      title: "Empresa seleccionada",
      detail: nextSettings.company.nombre_empresa,
    });
  }

  function submit(values: CompanyRegistrationFormValues) {
    const nextSettings = createCompany(createCompanyRecord(values, settings.profile.user_id));

    addDiagnostic({
      level: "info",
      title: "Empresa registrada",
      detail: `${nextSettings.company.nombre_empresa} | ${nextSettings.company.nit}`,
    });

    form.reset(defaults);
    setShowForm(false);
  }

  const errors = form.formState.errors;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
              <Network className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-semibold">Nexo Admin</p>
              <p className="text-sm text-slate-400">Seleccion de empresa</p>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </a>
        </header>

        <section className="grid flex-1 gap-6 py-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div className="space-y-5">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight">Elige la empresa para trabajar</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Las opciones administrativas se habilitan despues de seleccionar una empresa archivada o registrar una nueva.
              </p>
            </div>

            <div className="grid gap-3">
              {settings.companies.map((company) => (
                <article
                  key={company.id}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-teal-300" />
                        <h2 className="font-semibold text-white">{company.nombre_empresa}</h2>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{company.razon_social}</p>
                      <div className="mt-3 grid gap-1 text-xs text-slate-400">
                        <span>NIT: {company.nit}</span>
                        <span>Identificacion: {company.identificacion}</span>
                        <span>Actividad: {company.actividad_economica}</span>
                      </div>
                    </div>
                    <Button onClick={() => enterCompany(company.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Entrar
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <Button variant="secondary" onClick={() => setShowForm((value) => !value)}>
              <Plus className="h-4 w-4" />
              {showForm ? "Ocultar registro" : "Registrar empresa"}
            </Button>
          </div>

          {showForm ? (
            <Card className="border-slate-800 bg-white text-slate-950">
              <CardHeader>
                <h2 className="font-semibold text-slate-950">Registrar empresa</h2>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    NIT
                    <Input {...form.register("nit")} />
                    {errorText(errors.nit?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Nombre
                    <Input {...form.register("nombre_empresa")} />
                    {errorText(errors.nombre_empresa?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Correo
                    <Input type="email" {...form.register("email")} />
                    {errorText(errors.email?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Razon social
                    <Input {...form.register("razon_social")} />
                    {errorText(errors.razon_social?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Tipo de razon social
                    <Select {...form.register("tipo_razon_social")}>
                      <option value="Sociedad por acciones simplificada">Sociedad por acciones simplificada</option>
                      <option value="Sociedad limitada">Sociedad limitada</option>
                      <option value="Sociedad anonima">Sociedad anonima</option>
                      <option value="Persona natural">Persona natural</option>
                      <option value="Entidad sin animo de lucro">Entidad sin animo de lucro</option>
                      <option value="Otra">Otra</option>
                    </Select>
                    {errorText(errors.tipo_razon_social?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Tipo de identificacion
                    <Select {...form.register("tipo_identificacion")}>
                      <option value="NIT">NIT</option>
                      <option value="CC">Cedula de ciudadania</option>
                      <option value="CE">Cedula de extranjeria</option>
                      <option value="PA">Pasaporte</option>
                      <option value="Otro">Otro</option>
                    </Select>
                    {errorText(errors.tipo_identificacion?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Identificacion
                    <Input {...form.register("identificacion")} />
                    {errorText(errors.identificacion?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Digito de verificacion
                    <Input inputMode="numeric" maxLength={1} {...form.register("digito_verificacion")} />
                    {errorText(errors.digito_verificacion?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                    Actividad economica
                    <Input {...form.register("actividad_economica")} />
                    {errorText(errors.actividad_economica?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                    Responsabilidades fiscales
                    <Textarea {...form.register("responsabilidades_fiscales")} />
                    {errorText(errors.responsabilidades_fiscales?.message)}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                    Tributos
                    <Textarea {...form.register("tributos")} />
                    {errorText(errors.tributos?.message)}
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full">
                      Registrar y entrar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}
