"use client";

import {
  Archive,
  BadgeDollarSign,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  HandCoins,
  Landmark,
  Package,
  ReceiptText,
  ShoppingBag,
  Truck,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ZodTypeAny } from "zod";
import {
  accountsPayable,
  clients,
  employees,
  expenses,
  inventoryMovements,
  invoices,
  payments,
  payrolls,
  products,
  quotes,
  suppliers,
  warehouses,
} from "@/services/mock-data";
import {
  clientSchema,
  employeeSchema,
  expenseSchema,
  paymentSchema,
  productSchema,
  supplierSchema,
} from "@/lib/validations/schemas";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateInventoryValue, calculateMargin } from "@/lib/calculations/business";

export type ModuleKey =
  | "clientes"
  | "proveedores"
  | "productos"
  | "bodegas"
  | "inventario"
  | "cotizaciones"
  | "facturas"
  | "pagos"
  | "cartera"
  | "gastos"
  | "cuentas-por-pagar"
  | "empleados"
  | "nomina";

export type FieldType = "text" | "email" | "number" | "date" | "select" | "textarea";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  kind?: "currency" | "date" | "status" | "percent" | "number";
}

export interface ModuleFilter {
  key: string;
  label: string;
  options: string[];
}

export interface ModuleDefinition {
  key: ModuleKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  rows: unknown[];
  searchKeys: string[];
  filters: ModuleFilter[];
  columns: TableColumn[];
  formSchema?: ZodTypeAny;
  formFields: FormField[];
  createLabel: string;
  pdf?: "quote" | "invoice" | "receipt" | "payroll";
  notice?: string;
  metrics: Array<{ label: string; value: string; helper: string }>;
}

const statusOptions = ["activo", "inactivo"];
const paymentOptions = ["efectivo", "transferencia", "tarjeta", "credito"];

export const moduleRegistry: Record<ModuleKey, ModuleDefinition> = {
  clientes: {
    key: "clientes",
    title: "Clientes",
    subtitle: "Gestion de contactos, cartera, historial comercial y datos fiscales internos.",
    icon: UsersRound,
    rows: clients,
    searchKeys: ["nombre", "numero_documento", "email", "direccion", "ciudad"],
    filters: [
      { key: "estado", label: "Estado", options: statusOptions },
      { key: "ciudad", label: "Ciudad", options: ["Bogota", "Medellin", "Cali", "Cartagena"] },
    ],
    columns: [
      { key: "nombre", label: "Cliente" },
      { key: "numero_documento", label: "Documento" },
      { key: "email", label: "Correo" },
      { key: "direccion", label: "Direccion" },
      { key: "ciudad", label: "Ciudad" },
      { key: "saldo_pendiente", label: "Saldo", kind: "currency" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formSchema: clientSchema,
    formFields: [
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "tipo_documento", label: "Tipo documento", type: "select", options: ["NIT", "CC", "CE"] },
      { name: "numero_documento", label: "Numero documento", type: "text" },
      { name: "email", label: "Correo", type: "email" },
      { name: "telefono", label: "Telefono", type: "text" },
      { name: "direccion", label: "Direccion", type: "text" },
      { name: "ciudad", label: "Ciudad", type: "text" },
      { name: "estado", label: "Estado", type: "select", options: statusOptions },
    ],
    createLabel: "Nuevo cliente",
    metrics: [
      { label: "Activos", value: String(clients.filter((row) => row.estado === "activo").length), helper: "Clientes con relacion vigente" },
      { label: "Saldo pendiente", value: formatCurrency(clients.reduce((sum, row) => sum + row.saldo_pendiente, 0)), helper: "Por cobrar asociado" },
      { label: "Ciudades", value: String(new Set(clients.map((row) => row.ciudad)).size), helper: "Cobertura comercial" },
    ],
  },
  proveedores: {
    key: "proveedores",
    title: "Proveedores",
    subtitle: "Control de aliados, compras, cuentas por pagar y notas operativas.",
    icon: Truck,
    rows: suppliers,
    searchKeys: ["nombre", "numero_documento", "email", "direccion", "ciudad"],
    filters: [
      { key: "estado", label: "Estado", options: statusOptions },
      { key: "ciudad", label: "Ciudad", options: ["Bogota", "Medellin", "Cali"] },
    ],
    columns: [
      { key: "nombre", label: "Proveedor" },
      { key: "numero_documento", label: "Documento" },
      { key: "email", label: "Correo" },
      { key: "direccion", label: "Direccion" },
      { key: "ciudad", label: "Ciudad" },
      { key: "saldo_pendiente", label: "Por pagar", kind: "currency" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formSchema: supplierSchema,
    formFields: [
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "tipo_documento", label: "Tipo documento", type: "select", options: ["NIT", "CC", "CE"] },
      { name: "numero_documento", label: "Numero documento", type: "text" },
      { name: "email", label: "Correo", type: "email" },
      { name: "telefono", label: "Telefono", type: "text" },
      { name: "direccion", label: "Direccion", type: "text" },
      { name: "ciudad", label: "Ciudad", type: "text" },
      { name: "estado", label: "Estado", type: "select", options: statusOptions },
    ],
    createLabel: "Nuevo proveedor",
    metrics: [
      { label: "Activos", value: String(suppliers.filter((row) => row.estado === "activo").length), helper: "Proveedores disponibles" },
      { label: "Saldo pendiente", value: formatCurrency(suppliers.reduce((sum, row) => sum + row.saldo_pendiente, 0)), helper: "Por pagar asociado" },
      { label: "Ciudades", value: String(new Set(suppliers.map((row) => row.ciudad)).size), helper: "Cobertura comercial" },
    ],
  },
  productos: {
    key: "productos",
    title: "Productos y servicios",
    subtitle: "Catalogo vendible con precios, costos, impuestos, stock y margen estimado.",
    icon: Package,
    rows: products.map((product) => ({ ...product, margen: calculateMargin(product) })),
    searchKeys: ["nombre", "sku", "codigo_barras", "categoria"],
    filters: [
      { key: "tipo", label: "Tipo", options: ["producto", "servicio"] },
      { key: "categoria", label: "Categoria", options: ["Alimentos", "Servicios", "Hardware", "Insumos", "Consultoria"] },
      { key: "estado", label: "Estado", options: statusOptions },
    ],
    columns: [
      { key: "nombre", label: "Nombre" },
      { key: "tipo", label: "Tipo", kind: "status" },
      { key: "sku", label: "SKU" },
      { key: "categoria", label: "Categoria" },
      { key: "precio_venta", label: "Precio", kind: "currency" },
      { key: "stock_actual", label: "Stock", kind: "number" },
      { key: "margen", label: "Margen", kind: "percent" },
    ],
    formSchema: productSchema,
    formFields: [
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "tipo", label: "Tipo", type: "select", options: ["producto", "servicio"] },
      { name: "sku", label: "SKU", type: "text" },
      { name: "categoria", label: "Categoria", type: "text" },
      { name: "precio_venta", label: "Precio venta", type: "number" },
      { name: "costo", label: "Costo", type: "number" },
      { name: "impuesto_porcentaje", label: "Impuesto %", type: "number" },
      { name: "stock_actual", label: "Stock actual", type: "number" },
      { name: "stock_minimo", label: "Stock minimo", type: "number" },
      { name: "estado", label: "Estado", type: "select", options: statusOptions },
    ],
    createLabel: "Nuevo item",
    metrics: [
      { label: "Items", value: String(products.length), helper: "Productos y servicios" },
      { label: "Bajo stock", value: String(products.filter((row) => row.tipo === "producto" && row.stock_actual <= row.stock_minimo).length), helper: "Requieren revision" },
      { label: "Inventario", value: formatCurrency(calculateInventoryValue(products)), helper: "Valor a costo" },
    ],
  },
  bodegas: {
    key: "bodegas",
    title: "Bodegas",
    subtitle: "Ubicaciones fisicas, responsables y existencias por punto operativo.",
    icon: Warehouse,
    rows: warehouses,
    searchKeys: ["nombre", "direccion", "responsable"],
    filters: [{ key: "estado", label: "Estado", options: statusOptions }],
    columns: [
      { key: "nombre", label: "Bodega" },
      { key: "direccion", label: "Direccion" },
      { key: "responsable", label: "Responsable" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formFields: [
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "direccion", label: "Direccion", type: "text" },
      { name: "responsable", label: "Responsable", type: "text" },
      { name: "estado", label: "Estado", type: "select", options: statusOptions },
    ],
    createLabel: "Nueva bodega",
    metrics: [
      { label: "Bodegas", value: String(warehouses.length), helper: "Ubicaciones activas" },
      { label: "Movimientos", value: String(inventoryMovements.length), helper: "Kardex demo" },
      { label: "Responsables", value: String(new Set(warehouses.map((row) => row.responsable)).size), helper: "Personas asignadas" },
    ],
  },
  inventario: {
    key: "inventario",
    title: "Inventario",
    subtitle: "Kardex, entradas, salidas, ajustes, traslados y valoracion por costo.",
    icon: Boxes,
    rows: inventoryMovements,
    searchKeys: ["product_name", "warehouse_name", "motivo", "tipo_movimiento"],
    filters: [
      { key: "tipo_movimiento", label: "Movimiento", options: ["entrada", "salida", "ajuste", "traslado"] },
      { key: "warehouse_name", label: "Bodega", options: warehouses.map((row) => row.nombre) },
    ],
    columns: [
      { key: "fecha", label: "Fecha", kind: "date" },
      { key: "product_name", label: "Producto" },
      { key: "warehouse_name", label: "Bodega" },
      { key: "tipo_movimiento", label: "Tipo", kind: "status" },
      { key: "cantidad", label: "Cantidad", kind: "number" },
      { key: "costo_unitario", label: "Costo", kind: "currency" },
      { key: "motivo", label: "Motivo" },
    ],
    formFields: [
      { name: "product_name", label: "Producto", type: "select", options: products.filter((row) => row.tipo === "producto").map((row) => row.nombre) },
      { name: "warehouse_name", label: "Bodega", type: "select", options: warehouses.map((row) => row.nombre) },
      { name: "tipo_movimiento", label: "Movimiento", type: "select", options: ["entrada", "salida", "ajuste", "traslado"] },
      { name: "cantidad", label: "Cantidad", type: "number" },
      { name: "costo_unitario", label: "Costo unitario", type: "number" },
      { name: "motivo", label: "Motivo", type: "textarea" },
      { name: "fecha", label: "Fecha", type: "date" },
    ],
    createLabel: "Registrar movimiento",
    metrics: [
      { label: "Movimientos", value: String(inventoryMovements.length), helper: "Entradas, salidas y ajustes" },
      { label: "Stock bajo", value: String(products.filter((row) => row.tipo === "producto" && row.stock_actual <= row.stock_minimo).length), helper: "Alertas activas" },
      { label: "Valor inventario", value: formatCurrency(calculateInventoryValue(products)), helper: "Calculado a costo" },
    ],
  },
  cotizaciones: {
    key: "cotizaciones",
    title: "Cotizaciones",
    subtitle: "Documentos comerciales con items, impuestos, estados, duplicado y PDF.",
    icon: ClipboardList,
    rows: quotes,
    searchKeys: ["numero", "client_name", "estado"],
    filters: [
      { key: "estado", label: "Estado", options: ["borrador", "enviada", "aceptada", "rechazada", "vencida"] },
      { key: "client_name", label: "Cliente", options: clients.map((row) => row.nombre) },
    ],
    columns: [
      { key: "numero", label: "Numero" },
      { key: "client_name", label: "Cliente" },
      { key: "fecha", label: "Fecha", kind: "date" },
      { key: "fecha_vencimiento", label: "Vence", kind: "date" },
      { key: "estado", label: "Estado", kind: "status" },
      { key: "total", label: "Total", kind: "currency" },
    ],
    formFields: [
      { name: "numero", label: "Numero", type: "text" },
      { name: "client_name", label: "Cliente", type: "select", options: clients.map((row) => row.nombre) },
      { name: "fecha", label: "Fecha", type: "date" },
      { name: "fecha_vencimiento", label: "Vencimiento", type: "date" },
      { name: "estado", label: "Estado", type: "select", options: ["borrador", "enviada", "aceptada", "rechazada", "vencida"] },
      { name: "notas", label: "Notas", type: "textarea" },
    ],
    createLabel: "Nueva cotizacion",
    pdf: "quote",
    metrics: [
      { label: "Pendientes", value: String(quotes.filter((row) => ["borrador", "enviada"].includes(row.estado)).length), helper: "Por gestionar" },
      { label: "Aceptadas", value: String(quotes.filter((row) => row.estado === "aceptada").length), helper: "Listas para facturar" },
      { label: "Total cotizado", value: formatCurrency(quotes.reduce((sum, row) => sum + row.total, 0)), helper: "Pipeline demo" },
    ],
  },
  facturas: {
    key: "facturas",
    title: "Facturas internas",
    subtitle: "Comprobantes internos, pagos parciales, cartera, inventario y PDF.",
    icon: ReceiptText,
    rows: invoices,
    searchKeys: ["numero", "client_name", "estado"],
    filters: [
      { key: "estado", label: "Estado", options: ["borrador", "enviada", "pagada", "parcialmente_pagada", "vencida", "anulada"] },
      { key: "client_name", label: "Cliente", options: clients.map((row) => row.nombre) },
    ],
    columns: [
      { key: "numero", label: "Numero" },
      { key: "client_name", label: "Cliente" },
      { key: "fecha", label: "Fecha", kind: "date" },
      { key: "fecha_vencimiento", label: "Vence", kind: "date" },
      { key: "estado", label: "Estado", kind: "status" },
      { key: "total", label: "Total", kind: "currency" },
      { key: "saldo_pendiente", label: "Saldo", kind: "currency" },
    ],
    formFields: [
      { name: "numero", label: "Numero", type: "text" },
      { name: "client_name", label: "Cliente", type: "select", options: clients.map((row) => row.nombre) },
      { name: "fecha", label: "Fecha", type: "date" },
      { name: "fecha_vencimiento", label: "Vencimiento", type: "date" },
      { name: "estado", label: "Estado", type: "select", options: ["borrador", "enviada", "pagada", "parcialmente_pagada", "vencida", "anulada"] },
      { name: "metodo_pago", label: "Metodo pago", type: "select", options: paymentOptions },
      { name: "notas", label: "Notas", type: "textarea" },
    ],
    createLabel: "Nueva factura",
    pdf: "invoice",
    notice: "Este documento es un comprobante interno. No reemplaza una factura electronica valida ante la DIAN.",
    metrics: [
      { label: "Emitidas", value: String(invoices.length), helper: "Documentos internos" },
      { label: "Por cobrar", value: formatCurrency(invoices.reduce((sum, row) => sum + row.saldo_pendiente, 0)), helper: "Saldo abierto" },
      { label: "Vencidas", value: String(invoices.filter((row) => row.estado === "vencida").length), helper: "Requieren cobro" },
    ],
  },
  pagos: {
    key: "pagos",
    title: "Pagos",
    subtitle: "Abonos, pagos totales, referencias, metodos y recibos.",
    icon: HandCoins,
    rows: payments,
    searchKeys: ["invoice_number", "client_name", "referencia", "metodo_pago"],
    filters: [{ key: "metodo_pago", label: "Metodo", options: paymentOptions }],
    columns: [
      { key: "fecha", label: "Fecha", kind: "date" },
      { key: "invoice_number", label: "Factura" },
      { key: "client_name", label: "Cliente" },
      { key: "valor", label: "Valor", kind: "currency" },
      { key: "metodo_pago", label: "Metodo", kind: "status" },
      { key: "referencia", label: "Referencia" },
    ],
    formSchema: paymentSchema,
    formFields: [
      { name: "invoice_id", label: "Factura", type: "select", options: invoices.map((row) => row.id) },
      { name: "fecha", label: "Fecha", type: "date" },
      { name: "valor", label: "Valor", type: "number" },
      { name: "metodo_pago", label: "Metodo", type: "select", options: paymentOptions },
      { name: "referencia", label: "Referencia", type: "text" },
      { name: "notas", label: "Notas", type: "textarea" },
    ],
    createLabel: "Registrar pago",
    pdf: "receipt",
    metrics: [
      { label: "Pagos", value: String(payments.length), helper: "Movimientos recibidos" },
      { label: "Recaudado", value: formatCurrency(payments.reduce((sum, row) => sum + row.valor, 0)), helper: "Total demo" },
      { label: "Facturas", value: String(new Set(payments.map((row) => row.invoice_id)).size), helper: "Con pagos registrados" },
    ],
  },
  cartera: {
    key: "cartera",
    title: "Cartera",
    subtitle: "Facturas pendientes, vencidas, saldos por cliente y dias de vencimiento.",
    icon: BadgeDollarSign,
    rows: invoices.filter((invoice) => invoice.saldo_pendiente > 0),
    searchKeys: ["numero", "client_name", "estado"],
    filters: [
      { key: "estado", label: "Estado", options: ["enviada", "parcialmente_pagada", "vencida"] },
      { key: "client_name", label: "Cliente", options: clients.map((row) => row.nombre) },
    ],
    columns: [
      { key: "numero", label: "Factura" },
      { key: "client_name", label: "Cliente" },
      { key: "fecha_vencimiento", label: "Vence", kind: "date" },
      { key: "estado", label: "Estado", kind: "status" },
      { key: "total", label: "Total", kind: "currency" },
      { key: "saldo_pendiente", label: "Saldo", kind: "currency" },
    ],
    formFields: [],
    createLabel: "Registrar gestion",
    metrics: [
      { label: "Total por cobrar", value: formatCurrency(invoices.reduce((sum, row) => sum + row.saldo_pendiente, 0)), helper: "Saldo abierto" },
      { label: "Vencidas", value: String(invoices.filter((row) => row.estado === "vencida").length), helper: "Con alerta visual" },
      { label: "Clientes con saldo", value: String(new Set(invoices.filter((row) => row.saldo_pendiente > 0).map((row) => row.client_id)).size), helper: "Relacionados" },
    ],
  },
  gastos: {
    key: "gastos",
    title: "Gastos y compras",
    subtitle: "Compras, servicios, impuestos, proveedores y estados de pago.",
    icon: ShoppingBag,
    rows: expenses,
    searchKeys: ["categoria", "descripcion", "supplier_name", "estado"],
    filters: [
      { key: "estado", label: "Estado", options: ["pagado", "pendiente", "vencido"] },
      { key: "categoria", label: "Categoria", options: ["Inventario", "Logistica", "Software", "Servicios", "Hardware"] },
    ],
    columns: [
      { key: "fecha", label: "Fecha", kind: "date" },
      { key: "categoria", label: "Categoria" },
      { key: "descripcion", label: "Descripcion" },
      { key: "supplier_name", label: "Proveedor" },
      { key: "total", label: "Total", kind: "currency" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formSchema: expenseSchema,
    formFields: [
      { name: "categoria", label: "Categoria", type: "text" },
      { name: "descripcion", label: "Descripcion", type: "textarea" },
      { name: "fecha", label: "Fecha", type: "date" },
      { name: "valor", label: "Valor", type: "number" },
      { name: "impuesto", label: "Impuesto", type: "number" },
      { name: "metodo_pago", label: "Metodo", type: "select", options: paymentOptions },
      { name: "estado", label: "Estado", type: "select", options: ["pagado", "pendiente", "vencido"] },
    ],
    createLabel: "Nuevo gasto",
    metrics: [
      { label: "Mes actual", value: formatCurrency(expenses.filter((row) => row.fecha.startsWith("2026-05")).reduce((sum, row) => sum + row.total, 0)), helper: "Gastos de mayo" },
      { label: "Pendientes", value: String(expenses.filter((row) => row.estado !== "pagado").length), helper: "Por pagar o revisar" },
      { label: "Categorias", value: String(new Set(expenses.map((row) => row.categoria)).size), helper: "Clasificacion" },
    ],
  },
  "cuentas-por-pagar": {
    key: "cuentas-por-pagar",
    title: "Cuentas por pagar",
    subtitle: "Obligaciones pendientes, saldos por proveedor y alertas de vencimiento.",
    icon: Landmark,
    rows: accountsPayable,
    searchKeys: ["supplier_name", "descripcion", "estado"],
    filters: [{ key: "estado", label: "Estado", options: ["pendiente", "vencido", "pagado"] }],
    columns: [
      { key: "supplier_name", label: "Proveedor" },
      { key: "descripcion", label: "Descripcion" },
      { key: "fecha_vencimiento", label: "Vence", kind: "date" },
      { key: "total", label: "Total", kind: "currency" },
      { key: "saldo_pendiente", label: "Saldo", kind: "currency" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formFields: [
      { name: "supplier_name", label: "Proveedor", type: "select", options: suppliers.map((row) => row.nombre) },
      { name: "descripcion", label: "Descripcion", type: "textarea" },
      { name: "fecha_vencimiento", label: "Vencimiento", type: "date" },
      { name: "total", label: "Total", type: "number" },
      { name: "estado", label: "Estado", type: "select", options: ["pendiente", "vencido", "pagado"] },
    ],
    createLabel: "Nueva cuenta",
    metrics: [
      { label: "Total por pagar", value: formatCurrency(accountsPayable.reduce((sum, row) => sum + row.saldo_pendiente, 0)), helper: "Obligaciones abiertas" },
      { label: "Vencidas", value: String(accountsPayable.filter((row) => row.estado === "vencido").length), helper: "Prioridad alta" },
      { label: "Proveedores", value: String(new Set(accountsPayable.map((row) => row.supplier_id)).size), helper: "Con saldo" },
    ],
  },
  empleados: {
    key: "empleados",
    title: "Empleados",
    subtitle: "Equipo, cargos, contratos, ingreso y estado operativo.",
    icon: UserRound,
    rows: employees,
    searchKeys: ["nombre", "documento", "email", "cargo"],
    filters: [
      { key: "estado", label: "Estado", options: statusOptions },
      { key: "tipo_contrato", label: "Contrato", options: ["Termino indefinido", "Termino fijo", "Prestacion de servicios"] },
    ],
    columns: [
      { key: "nombre", label: "Empleado" },
      { key: "documento", label: "Documento" },
      { key: "cargo", label: "Cargo" },
      { key: "salario_base", label: "Salario", kind: "currency" },
      { key: "fecha_ingreso", label: "Ingreso", kind: "date" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formSchema: employeeSchema,
    formFields: [
      { name: "nombre", label: "Nombre", type: "text" },
      { name: "documento", label: "Documento", type: "text" },
      { name: "email", label: "Correo", type: "email" },
      { name: "telefono", label: "Telefono", type: "text" },
      { name: "cargo", label: "Cargo", type: "text" },
      { name: "salario_base", label: "Salario base", type: "number" },
      { name: "tipo_contrato", label: "Contrato", type: "select", options: ["Termino indefinido", "Termino fijo", "Prestacion de servicios"] },
      { name: "fecha_ingreso", label: "Ingreso", type: "date" },
      { name: "estado", label: "Estado", type: "select", options: statusOptions },
    ],
    createLabel: "Nuevo empleado",
    metrics: [
      { label: "Empleados", value: String(employees.length), helper: "Activos demo" },
      { label: "Nomina base", value: formatCurrency(employees.reduce((sum, row) => sum + row.salario_base, 0)), helper: "Salarios mensuales" },
      { label: "Contratos", value: String(new Set(employees.map((row) => row.tipo_contrato)).size), helper: "Modalidades" },
    ],
  },
  nomina: {
    key: "nomina",
    title: "Nomina interna",
    subtitle: "Liquidaciones internas, novedades, vacaciones y comprobantes PDF.",
    icon: BriefcaseBusiness,
    rows: payrolls,
    searchKeys: ["periodo", "employee_name", "estado"],
    filters: [{ key: "estado", label: "Estado", options: ["borrador", "pagada", "anulada"] }],
    columns: [
      { key: "periodo", label: "Periodo" },
      { key: "employee_name", label: "Empleado" },
      { key: "salario_base", label: "Base", kind: "currency" },
      { key: "dias_trabajados", label: "Dias", kind: "number" },
      { key: "deducciones", label: "Deducciones", kind: "currency" },
      { key: "bonificaciones", label: "Bonos", kind: "currency" },
      { key: "total_pagado", label: "Total", kind: "currency" },
      { key: "estado", label: "Estado", kind: "status" },
    ],
    formFields: [
      { name: "periodo", label: "Periodo", type: "text" },
      { name: "employee_name", label: "Empleado", type: "select", options: employees.map((row) => row.nombre) },
      { name: "salario_base", label: "Salario base", type: "number" },
      { name: "dias_trabajados", label: "Dias trabajados", type: "number" },
      { name: "horas_extra", label: "Horas extra", type: "number" },
      { name: "deducciones", label: "Deducciones", type: "number" },
      { name: "bonificaciones", label: "Bonificaciones", type: "number" },
      { name: "estado", label: "Estado", type: "select", options: ["borrador", "pagada", "anulada"] },
    ],
    createLabel: "Nueva liquidacion",
    pdf: "payroll",
    notice: "Modulo interno. No implementa nomina electronica DIAN.",
    metrics: [
      { label: "Liquidaciones", value: String(payrolls.length), helper: "Periodo actual" },
      { label: "Total pagado", value: formatCurrency(payrolls.reduce((sum, row) => sum + row.total_pagado, 0)), helper: "Nomina demo" },
      { label: "Borradores", value: String(payrolls.filter((row) => row.estado === "borrador").length), helper: "Por aprobar" },
    ],
  },
};

export const mainNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: Archive },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/proveedores", label: "Proveedores", icon: Truck },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/facturas", label: "Facturas", icon: ReceiptText },
  { href: "/pos", label: "POS", icon: CreditCard },
  { href: "/inventario", label: "Inventario", icon: Boxes },
  { href: "/bodegas", label: "Bodegas", icon: Building2 },
  { href: "/gastos", label: "Gastos", icon: ShoppingBag },
  { href: "/pagos", label: "Pagos", icon: Banknote },
  { href: "/cartera", label: "Cartera", icon: BadgeDollarSign },
  { href: "/cuentas-por-pagar", label: "Por pagar", icon: Landmark },
  { href: "/reportes", label: "Reportes", icon: ClipboardList },
  { href: "/nomina", label: "Nomina", icon: BriefcaseBusiness },
  { href: "/configuracion", label: "Configuracion", icon: Building2 },
];

export function formatTableValue(value: unknown, column: TableColumn) {
  if (value === undefined || value === null || value === "") return "N/A";
  if (column.kind === "currency" && typeof value === "number") return formatCurrency(value);
  if (column.kind === "date" && typeof value === "string") return formatDate(value);
  if (column.kind === "percent" && typeof value === "number") return `${value}%`;
  return String(value);
}
