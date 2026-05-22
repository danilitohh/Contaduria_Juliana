# Nexo Admin

Plataforma web administrativa original construida con Next.js App Router, TypeScript, Tailwind CSS, datos mock y preparacion para Supabase.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. La app redirige a `/dashboard`.

## Stack incluido

- Next.js App Router, React 19 y TypeScript.
- Tailwind CSS.
- Supabase JS preparado en `lib/supabase`.
- React Hook Form y Zod en formularios.
- Recharts para dashboard y reportes.
- jsPDF para cotizacion, factura interna, recibo y nomina.
- Lucide React para iconografia.

## Estructura

- `app/(auth)`: login y registro demo.
- `app/(dashboard)`: rutas privadas del ERP/CRM.
- `components/layout`: sidebar, topbar y shell.
- `components/modules`: pantallas de modulos, POS, reportes y configuracion.
- `components/tables`, `components/charts`, `components/ui`: reutilizables.
- `services/mock-data.ts`: datos demo.
- `services/modules.tsx`: configuracion de tablas, filtros y formularios.
- `lib/calculations`: calculos de documentos, cartera, inventario y caja.
- `lib/pdf`: plantillas PDF originales.
- `db/schema.sql`: tablas PostgreSQL y politicas RLS.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `db/schema.sql` en SQL Editor.
3. Copia `.env.example` a `.env.local`.
4. Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Cuando Auth este conectado a los formularios reales, cambia `NEXO_REQUIRE_AUTH=true`.

El esquema usa `user_id` en cada tabla y RLS para que cada usuario solo vea y modifique sus propios datos.

## Pendiente para produccion

- Reemplazar mocks por repositorios Supabase y Server Actions.
- Conectar login, registro, logout y recuperacion de contrasena con Supabase Auth.
- Implementar permisos por rol y auditoria.
- Persistir CRUD, items de documentos, pagos, inventario y caja en transacciones.
- Subir comprobantes y logos a Supabase Storage.
- Agregar pruebas unitarias, integracion y e2e.
- Validar consecutivos concurrentes en base de datos.
- Ajustar seguridad, backups, monitoreo y observabilidad.

## Facturacion electronica Colombia

Las facturas actuales son comprobantes internos. Para facturacion electronica real ante la DIAN falta integrar un proveedor tecnologico autorizado o implementar el flujo normativo completo: habilitacion, resoluciones, numeracion, CUFE/CUDE, firma digital, XML UBL, envio y validacion DIAN, acuses, notas credito/debito, contingencia y conservacion documental.
