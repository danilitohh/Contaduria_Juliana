import type { CashSession, DocumentItem, Product } from "@/types/business";

export interface LineInput {
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  impuesto_porcentaje?: number;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSubtotal(items: LineInput[]) {
  return roundMoney(
    items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0),
  );
}

export function calculateDiscount(items: LineInput[]) {
  return roundMoney(
    items.reduce((sum, item) => {
      const gross = item.cantidad * item.precio_unitario;
      return sum + gross * ((item.descuento ?? 0) / 100);
    }, 0),
  );
}

export function calculateTaxes(items: LineInput[]) {
  return roundMoney(
    items.reduce((sum, item) => {
      const gross = item.cantidad * item.precio_unitario;
      const discounted = gross - gross * ((item.descuento ?? 0) / 100);
      return sum + discounted * ((item.impuesto_porcentaje ?? 0) / 100);
    }, 0),
  );
}

export function calculateLineTotal(item: LineInput) {
  const gross = item.cantidad * item.precio_unitario;
  const discount = gross * ((item.descuento ?? 0) / 100);
  const taxable = gross - discount;
  const taxes = taxable * ((item.impuesto_porcentaje ?? 0) / 100);

  return roundMoney(taxable + taxes);
}

export function calculateDocumentTotals(items: LineInput[]) {
  const subtotal = calculateSubtotal(items);
  const descuento_total = calculateDiscount(items);
  const impuesto_total = calculateTaxes(items);
  const total = roundMoney(subtotal - descuento_total + impuesto_total);

  return {
    subtotal,
    descuento_total,
    impuesto_total,
    total,
  };
}

export function normalizeDocumentItems(items: LineInput[]): DocumentItem[] {
  return items.map((item, index) => ({
    id: `item-${index + 1}`,
    descripcion: `Linea ${index + 1}`,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    descuento: item.descuento ?? 0,
    impuesto_porcentaje: item.impuesto_porcentaje ?? 0,
    total_linea: calculateLineTotal(item),
  }));
}

export function calculatePendingBalance(total: number, paid: number) {
  return Math.max(0, roundMoney(total - paid));
}

export function calculateEstimatedProfit(revenue: number, expenses: number, costOfGoods = 0) {
  return roundMoney(revenue - expenses - costOfGoods);
}

export function isLowStock(product: Pick<Product, "tipo" | "stock_actual" | "stock_minimo">) {
  return product.tipo === "producto" && product.stock_actual <= product.stock_minimo;
}

export function calculateInventoryValue(products: Product[]) {
  return roundMoney(
    products
      .filter((product) => product.tipo === "producto")
      .reduce((sum, product) => sum + product.stock_actual * product.costo, 0),
  );
}

export function calculateMargin(product: Pick<Product, "precio_venta" | "costo">) {
  if (!product.precio_venta) return 0;

  return roundMoney(((product.precio_venta - product.costo) / product.precio_venta) * 100);
}

export function calculateCashClosing(session: Pick<CashSession, "efectivo" | "transferencia" | "tarjeta" | "base_inicial" | "total_contado">) {
  const total_sistema = roundMoney(
    session.base_inicial + session.efectivo + session.transferencia + session.tarjeta,
  );
  const diferencia = roundMoney(session.total_contado - total_sistema);

  return {
    total_sistema,
    diferencia,
  };
}
