import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col justify-between bg-slate-950 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            N
          </div>
          <div>
            <p className="text-lg font-semibold">Nexo Admin</p>
            <p className="text-sm text-slate-400">ERP/CRM administrativo</p>
          </div>
        </div>
        <div className="max-w-xl py-16">
          <h1 className="text-4xl font-semibold tracking-tight">Control operativo con identidad propia.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Clientes, inventario, comprobantes internos, cartera, POS, reportes y configuracion empresarial en un solo espacio.
          </p>
        </div>
        <p className="text-xs text-slate-500">Modo demo preparado para Supabase Auth.</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-950">{children}</section>
    </main>
  );
}
