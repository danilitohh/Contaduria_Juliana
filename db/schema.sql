create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  rol text not null default 'propietario' check (rol in ('propietario', 'administrador', 'operador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre_empresa text not null,
  logo_url text,
  identificacion text not null,
  email text not null,
  telefono text,
  direccion text,
  ciudad text,
  pais text default 'Colombia',
  moneda text default 'COP',
  impuesto_default numeric(8,2) default 19,
  prefijo_factura text default 'NI',
  consecutivo_factura integer default 1,
  prefijo_cotizacion text default 'CT',
  consecutivo_cotizacion integer default 1,
  terminos_default text,
  color_marca text default '#0f766e',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo_documento text not null,
  numero_documento text not null,
  email text,
  telefono text,
  direccion text,
  ciudad text,
  departamento text,
  pais text default 'Colombia',
  notas text,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero_documento)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo_documento text not null,
  numero_documento text not null,
  email text,
  telefono text,
  direccion text,
  ciudad text,
  notas text,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero_documento)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  descripcion text,
  tipo text not null check (tipo in ('producto', 'servicio')),
  sku text,
  codigo_barras text,
  categoria text,
  precio_venta numeric(14,2) not null default 0,
  costo numeric(14,2) not null default 0,
  impuesto_porcentaje numeric(8,2) not null default 0,
  stock_actual numeric(14,2) not null default 0,
  stock_minimo numeric(14,2) not null default 0,
  unidad_medida text default 'unidad',
  imagen_url text,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sku)
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  direccion text,
  responsable text,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  tipo_movimiento text not null check (tipo_movimiento in ('entrada', 'salida', 'ajuste', 'traslado')),
  cantidad numeric(14,2) not null,
  costo_unitario numeric(14,2) not null default 0,
  motivo text,
  referencia_tipo text,
  referencia_id uuid,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero text not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  fecha date not null default current_date,
  fecha_vencimiento date,
  estado text not null default 'borrador' check (estado in ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida')),
  subtotal numeric(14,2) not null default 0,
  descuento_total numeric(14,2) not null default 0,
  impuesto_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notas text,
  terminos_condiciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  descripcion text not null,
  cantidad numeric(14,2) not null,
  precio_unitario numeric(14,2) not null,
  descuento numeric(8,2) not null default 0,
  impuesto_porcentaje numeric(8,2) not null default 0,
  total_linea numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero text not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  fecha date not null default current_date,
  fecha_vencimiento date,
  estado text not null default 'borrador' check (estado in ('borrador', 'enviada', 'pagada', 'parcialmente_pagada', 'vencida', 'anulada')),
  metodo_pago text check (metodo_pago in ('efectivo', 'transferencia', 'tarjeta', 'credito')),
  subtotal numeric(14,2) not null default 0,
  descuento_total numeric(14,2) not null default 0,
  impuesto_total numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  total_pagado numeric(14,2) not null default 0,
  saldo_pendiente numeric(14,2) not null default 0,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  descripcion text not null,
  cantidad numeric(14,2) not null,
  precio_unitario numeric(14,2) not null,
  descuento numeric(8,2) not null default 0,
  impuesto_porcentaje numeric(8,2) not null default 0,
  total_linea numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  fecha date not null default current_date,
  valor numeric(14,2) not null,
  metodo_pago text not null check (metodo_pago in ('efectivo', 'transferencia', 'tarjeta', 'credito')),
  referencia text,
  notas text,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  categoria text not null,
  descripcion text not null,
  fecha date not null default current_date,
  valor numeric(14,2) not null default 0,
  impuesto numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  metodo_pago text check (metodo_pago in ('efectivo', 'transferencia', 'tarjeta', 'credito')),
  estado text not null default 'pendiente' check (estado in ('pagado', 'pendiente', 'vencido')),
  archivo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  descripcion text not null,
  fecha_vencimiento date,
  total numeric(14,2) not null default 0,
  saldo_pendiente numeric(14,2) not null default 0,
  estado text not null default 'pendiente' check (estado in ('pagado', 'pendiente', 'vencido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  apertura timestamptz not null default now(),
  cierre timestamptz,
  base_inicial numeric(14,2) not null default 0,
  efectivo numeric(14,2) not null default 0,
  transferencia numeric(14,2) not null default 0,
  tarjeta numeric(14,2) not null default 0,
  total_sistema numeric(14,2) not null default 0,
  total_contado numeric(14,2) not null default 0,
  diferencia numeric(14,2) not null default 0,
  observaciones text,
  estado text not null default 'abierta' check (estado in ('abierta', 'cerrada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cash_session_id uuid not null references public.cash_sessions(id) on delete cascade,
  tipo text not null check (tipo in ('apertura', 'venta', 'retiro', 'ingreso', 'cierre')),
  metodo_pago text check (metodo_pago in ('efectivo', 'transferencia', 'tarjeta', 'credito')),
  valor numeric(14,2) not null default 0,
  referencia_tipo text,
  referencia_id uuid,
  observaciones text,
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  documento text not null,
  email text,
  telefono text,
  cargo text,
  salario_base numeric(14,2) not null default 0,
  tipo_contrato text,
  fecha_ingreso date,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, documento)
);

create table public.payrolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  periodo text not null,
  empleado_id uuid not null references public.employees(id) on delete restrict,
  salario_base numeric(14,2) not null default 0,
  dias_trabajados integer not null default 30,
  horas_extra numeric(14,2) not null default 0,
  deducciones numeric(14,2) not null default 0,
  bonificaciones numeric(14,2) not null default 0,
  total_pagado numeric(14,2) not null default 0,
  estado text not null default 'borrador' check (estado in ('borrador', 'pagada', 'anulada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients(user_id);
create index suppliers_user_id_idx on public.suppliers(user_id);
create index products_user_id_idx on public.products(user_id);
create index invoices_user_id_estado_idx on public.invoices(user_id, estado);
create index quotes_user_id_estado_idx on public.quotes(user_id, estado);
create index expenses_user_id_fecha_idx on public.expenses(user_id, fecha);
create index inventory_movements_user_product_idx on public.inventory_movements(user_id, product_id);

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger company_settings_touch_updated_at before update on public.company_settings for each row execute function public.touch_updated_at();
create trigger clients_touch_updated_at before update on public.clients for each row execute function public.touch_updated_at();
create trigger suppliers_touch_updated_at before update on public.suppliers for each row execute function public.touch_updated_at();
create trigger products_touch_updated_at before update on public.products for each row execute function public.touch_updated_at();
create trigger warehouses_touch_updated_at before update on public.warehouses for each row execute function public.touch_updated_at();
create trigger quotes_touch_updated_at before update on public.quotes for each row execute function public.touch_updated_at();
create trigger quote_items_touch_updated_at before update on public.quote_items for each row execute function public.touch_updated_at();
create trigger invoices_touch_updated_at before update on public.invoices for each row execute function public.touch_updated_at();
create trigger invoice_items_touch_updated_at before update on public.invoice_items for each row execute function public.touch_updated_at();
create trigger expenses_touch_updated_at before update on public.expenses for each row execute function public.touch_updated_at();
create trigger accounts_payable_touch_updated_at before update on public.accounts_payable for each row execute function public.touch_updated_at();
create trigger cash_sessions_touch_updated_at before update on public.cash_sessions for each row execute function public.touch_updated_at();
create trigger employees_touch_updated_at before update on public.employees for each row execute function public.touch_updated_at();
create trigger payrolls_touch_updated_at before update on public.payrolls for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.company_settings enable row level security;
alter table public.clients enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.accounts_payable enable row level security;
alter table public.cash_sessions enable row level security;
alter table public.cash_movements enable row level security;
alter table public.employees enable row level security;
alter table public.payrolls enable row level security;

create or replace function public.create_owner_policies(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('create policy %I on public.%I for select using (auth.uid() = user_id)', table_name || '_select_own', table_name);
  execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id)', table_name || '_insert_own', table_name);
  execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name || '_update_own', table_name);
  execute format('create policy %I on public.%I for delete using (auth.uid() = user_id)', table_name || '_delete_own', table_name);
end;
$$;

select public.create_owner_policies('profiles');
select public.create_owner_policies('company_settings');
select public.create_owner_policies('clients');
select public.create_owner_policies('suppliers');
select public.create_owner_policies('products');
select public.create_owner_policies('warehouses');
select public.create_owner_policies('inventory_movements');
select public.create_owner_policies('quotes');
select public.create_owner_policies('quote_items');
select public.create_owner_policies('invoices');
select public.create_owner_policies('invoice_items');
select public.create_owner_policies('payments');
select public.create_owner_policies('expenses');
select public.create_owner_policies('accounts_payable');
select public.create_owner_policies('cash_sessions');
select public.create_owner_policies('cash_movements');
select public.create_owner_policies('employees');
select public.create_owner_policies('payrolls');

drop function public.create_owner_policies(text);
