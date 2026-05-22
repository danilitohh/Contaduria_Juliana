"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ReceiptText, Search, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations/business";
import { formatCurrency } from "@/lib/utils";
import { cashSessions, clients, products } from "@/services/mock-data";
import type { PaymentMethod, Product } from "@/types/business";

interface CartLine {
  product: Product;
  cantidad: number;
  descuento: number;
}

export function PosPage() {
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lastSale, setLastSale] = useState<string | null>(null);

  const availableProducts = products.filter((product) =>
    [product.nombre, product.sku, product.codigo_barras, product.categoria]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const items = cart.map((line) => ({
    cantidad: line.cantidad,
    precio_unitario: line.product.precio_venta,
    descuento: line.descuento,
    impuesto_porcentaje: line.product.impuesto_porcentaje,
  }));

  const totals = useMemo(() => calculateDocumentTotals(items), [items]);
  const selectedClient = clients.find((client) => client.id === clientId);

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, cantidad: line.cantidad + 1 } : line,
        );
      }
      return [...current, { product, cantidad: 1, descuento: 0 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, cantidad: Math.max(1, line.cantidad + delta) }
            : line,
        )
        .filter((line) => line.cantidad > 0),
    );
  }

  function finishSale() {
    if (!cart.length) return;
    const number = `POS-${String(cart.length).padStart(2, "0")}-${Math.round(totals.total)}`;
    setLastSale(`${number} | ${selectedClient?.nombre ?? "Consumidor final"} | ${formatCurrency(totals.total)}`);
    setCart([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">POS</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">Venta rapida, carrito, caja diaria y comprobante interno.</p>
            </div>
          </div>
        </div>
        <Card className="min-w-72">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Caja actual</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(cashSessions[0].total_sistema)}</p>
            </div>
            <Badge value={cashSessions[0].estado} />
          </CardContent>
        </Card>
      </div>

      {lastSale ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Venta finalizada: {lastSale}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por producto, SKU o codigo"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {availableProducts.slice(0, 12).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-600 hover:bg-teal-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{product.nombre}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.sku || product.tipo}</p>
                    </div>
                    <Badge value={product.tipo} />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-lg font-semibold text-teal-700">{formatCurrency(product.precio_venta)}</p>
                    <p className="text-xs text-slate-500">Stock {product.tipo === "servicio" ? "N/A" : product.stock_actual}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Carrito</h2>
                <p className="text-sm text-slate-500">{cart.length} lineas</p>
              </div>
              <ReceiptText className="h-5 w-5 text-teal-700" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={clientId} onChange={(event) => setClientId(event.target.value)}>
              <option value="">Consumidor final</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </Select>

            <div className="space-y-3">
              {cart.map((line) => {
                const total = calculateLineTotal({
                  cantidad: line.cantidad,
                  precio_unitario: line.product.precio_venta,
                  descuento: line.descuento,
                  impuesto_porcentaje: line.product.impuesto_porcentaje,
                });
                return (
                  <div key={line.product.id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{line.product.nombre}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(line.product.precio_venta)}</p>
                      </div>
                      <button
                        className="text-red-600"
                        aria-label="Quitar producto"
                        onClick={() => setCart((current) => current.filter((item) => item.product.id !== line.product.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="secondary" onClick={() => changeQuantity(line.product.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{line.cantidad}</span>
                        <Button size="icon" variant="secondary" onClick={() => changeQuantity(line.product.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold text-slate-950">{formatCurrency(total)}</p>
                    </div>
                  </div>
                );
              })}
              {!cart.length ? <p className="py-8 text-center text-sm text-slate-500">Agrega productos para iniciar la venta.</p> : null}
            </div>

            <Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="credito">Credito</option>
            </Select>

            <div className="space-y-2 rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>{formatCurrency(totals.descuento_total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span>{formatCurrency(totals.impuesto_total)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <Button className="w-full" disabled={!cart.length} onClick={finishSale}>
              Finalizar venta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
