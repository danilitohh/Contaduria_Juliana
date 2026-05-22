export type RecordStatus = "activo" | "inactivo";
export type ProductKind = "producto" | "servicio";
export type InventoryMovementType = "entrada" | "salida" | "ajuste" | "traslado";
export type QuoteStatus = "borrador" | "enviada" | "aceptada" | "rechazada" | "vencida";
export type InvoiceStatus =
  | "borrador"
  | "enviada"
  | "pagada"
  | "parcialmente_pagada"
  | "vencida"
  | "anulada";
export type ExpenseStatus = "pagado" | "pendiente" | "vencido";
export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "credito";
export type PayrollStatus = "borrador" | "pagada" | "anulada";

export interface BaseRecord {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile extends BaseRecord {
  nombre: string;
  email: string;
  rol: "propietario" | "administrador" | "operador";
}

export interface CompanySettings extends BaseRecord {
  nombre_empresa: string;
  logo_url?: string;
  nit: string;
  razon_social: string;
  tipo_razon_social: string;
  tipo_identificacion: string;
  identificacion: string;
  digito_verificacion: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  actividad_economica: string;
  responsabilidades_fiscales: string;
  tributos: string;
  moneda: string;
  impuesto_default: number;
  prefijo_factura: string;
  consecutivo_factura: number;
  prefijo_cotizacion: string;
  consecutivo_cotizacion: number;
  terminos_default: string;
  color_marca: string;
}

export interface Client extends BaseRecord {
  nombre: string;
  tipo_documento: string;
  numero_documento: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  notas: string;
  estado: RecordStatus;
  saldo_pendiente: number;
}

export interface Supplier extends BaseRecord {
  nombre: string;
  tipo_documento: string;
  numero_documento: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas: string;
  estado: RecordStatus;
  saldo_pendiente: number;
}

export interface Product extends BaseRecord {
  nombre: string;
  descripcion: string;
  tipo: ProductKind;
  sku: string;
  codigo_barras: string;
  categoria: string;
  precio_venta: number;
  costo: number;
  impuesto_porcentaje: number;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  imagen_url?: string;
  estado: RecordStatus;
}

export interface Warehouse extends BaseRecord {
  nombre: string;
  direccion: string;
  responsable: string;
  estado: RecordStatus;
}

export interface InventoryMovement extends BaseRecord {
  product_id: string;
  product_name: string;
  warehouse_id: string;
  warehouse_name: string;
  tipo_movimiento: InventoryMovementType;
  cantidad: number;
  costo_unitario: number;
  motivo: string;
  referencia_tipo?: string;
  referencia_id?: string;
  fecha: string;
}

export interface DocumentItem {
  id: string;
  product_id?: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  impuesto_porcentaje: number;
  total_linea: number;
}

export interface Quote extends BaseRecord {
  numero: string;
  client_id: string;
  client_name: string;
  fecha: string;
  fecha_vencimiento: string;
  estado: QuoteStatus;
  subtotal: number;
  descuento_total: number;
  impuesto_total: number;
  total: number;
  notas: string;
  terminos_condiciones: string;
  items: DocumentItem[];
}

export interface Invoice extends BaseRecord {
  numero: string;
  client_id: string;
  client_name: string;
  quote_id?: string;
  fecha: string;
  fecha_vencimiento: string;
  estado: InvoiceStatus;
  metodo_pago: PaymentMethod;
  subtotal: number;
  descuento_total: number;
  impuesto_total: number;
  total: number;
  total_pagado: number;
  saldo_pendiente: number;
  notas: string;
  items: DocumentItem[];
}

export interface Payment extends BaseRecord {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  fecha: string;
  valor: number;
  metodo_pago: PaymentMethod;
  referencia: string;
  notas: string;
}

export interface Expense extends BaseRecord {
  supplier_id?: string;
  supplier_name?: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  valor: number;
  impuesto: number;
  total: number;
  metodo_pago: PaymentMethod;
  estado: ExpenseStatus;
  archivo_url?: string;
}

export interface AccountPayable extends BaseRecord {
  supplier_id: string;
  supplier_name: string;
  descripcion: string;
  fecha_vencimiento: string;
  total: number;
  saldo_pendiente: number;
  estado: ExpenseStatus;
}

export interface CashSession extends BaseRecord {
  apertura: string;
  cierre?: string;
  base_inicial: number;
  efectivo: number;
  transferencia: number;
  tarjeta: number;
  total_sistema: number;
  total_contado: number;
  diferencia: number;
  observaciones: string;
  estado: "abierta" | "cerrada";
}

export interface Employee extends BaseRecord {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  cargo: string;
  salario_base: number;
  tipo_contrato: string;
  fecha_ingreso: string;
  estado: RecordStatus;
}

export interface Payroll extends BaseRecord {
  periodo: string;
  empleado_id: string;
  employee_name: string;
  salario_base: number;
  dias_trabajados: number;
  horas_extra: number;
  deducciones: number;
  bonificaciones: number;
  total_pagado: number;
  estado: PayrollStatus;
}

export interface DashboardMetric {
  label: string;
  value: string;
  helper: string;
  trend: string;
}

export interface ChartPoint {
  name: string;
  ventas?: number;
  gastos?: number;
  utilidad?: number;
  total?: number;
}
