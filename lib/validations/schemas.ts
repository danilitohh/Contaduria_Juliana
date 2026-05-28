import { z } from "zod";

const money = z.coerce.number().min(0, "Debe ser mayor o igual a cero");
const requiredText = z.string().min(2, "Este campo es obligatorio");

export const clientSchema = z.object({
  nombre: requiredText,
  tipo_documento: z.string().min(1, "Selecciona un tipo"),
  numero_documento: z.string().min(4, "Ingresa un documento valido"),
  email: z.string().email("Correo invalido"),
  telefono: z.string().min(7, "Ingresa un telefono"),
  direccion: requiredText,
  ciudad: requiredText,
  estado: z.enum(["activo", "inactivo"]),
});

export const supplierSchema = clientSchema.pick({
  nombre: true,
  tipo_documento: true,
  numero_documento: true,
  email: true,
  telefono: true,
  direccion: true,
  ciudad: true,
  estado: true,
});

export const productSchema = z.object({
  nombre: requiredText,
  tipo: z.enum(["producto", "servicio"]),
  sku: z.string().min(2, "Ingresa un SKU"),
  categoria: requiredText,
  precio_venta: money,
  costo: money,
  impuesto_porcentaje: z.coerce.number().min(0).max(100),
  stock_actual: z.coerce.number().min(0),
  stock_minimo: z.coerce.number().min(0),
  estado: z.enum(["activo", "inactivo"]),
});

export const expenseSchema = z.object({
  categoria: requiredText,
  descripcion: requiredText,
  fecha: z.string().min(8),
  valor: money,
  impuesto: money,
  metodo_pago: z.enum(["efectivo", "transferencia", "tarjeta", "credito"]),
  estado: z.enum(["pagado", "pendiente", "vencido"]),
});

export const paymentSchema = z.object({
  invoice_id: z.string().min(1),
  fecha: z.string().min(8),
  valor: money,
  metodo_pago: z.enum(["efectivo", "transferencia", "tarjeta", "credito"]),
  referencia: z.string().optional(),
  notas: z.string().optional(),
});

export const companySchema = z.object({
  nombre_empresa: requiredText,
  logo_url: z.string().max(1_200_000, "El logo es demasiado pesado").optional(),
  nit: z.string().min(4, "Ingresa un NIT valido"),
  razon_social: requiredText,
  tipo_razon_social: requiredText,
  tipo_identificacion: z.string().min(1, "Selecciona un tipo"),
  identificacion: requiredText,
  digito_verificacion: z.string().regex(/^\d$/, "Debe ser un digito"),
  email: z.string().email(),
  telefono: z.string().min(7),
  direccion: requiredText,
  ciudad: requiredText,
  pais: requiredText,
  actividad_economica: requiredText,
  responsabilidades_fiscales: requiredText,
  tributos: requiredText,
  moneda: z.string().min(3),
  impuesto_default: z.coerce.number().min(0).max(100),
  prefijo_factura: z.string().min(1),
  consecutivo_factura: z.coerce.number().min(1),
  prefijo_cotizacion: z.string().min(1),
  consecutivo_cotizacion: z.coerce.number().min(1),
  terminos_default: z.string().min(5),
  color_marca: z.string().min(4),
});

export const companyRegistrationSchema = companySchema.pick({
  nit: true,
  nombre_empresa: true,
  email: true,
  razon_social: true,
  tipo_razon_social: true,
  tipo_identificacion: true,
  identificacion: true,
  digito_verificacion: true,
  actividad_economica: true,
  responsabilidades_fiscales: true,
  tributos: true,
});

export const profileSchema = z.object({
  nombre: requiredText,
  email: z.string().email(),
  rol: z.enum(["propietario", "administrador", "operador"]),
});

export const appSettingsSchema = z.object({
  company: companySchema,
  profile: profileSchema,
});

export const employeeSchema = z.object({
  nombre: requiredText,
  documento: requiredText,
  email: z.string().email(),
  telefono: z.string().min(7),
  cargo: requiredText,
  salario_base: money,
  tipo_contrato: requiredText,
  fecha_ingreso: z.string().min(8),
  estado: z.enum(["activo", "inactivo"]),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type CompanyFormValues = z.infer<typeof companySchema>;
export type CompanyRegistrationFormValues = z.infer<typeof companyRegistrationSchema>;
export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;
