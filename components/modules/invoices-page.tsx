"use client";

import { useMemo, useRef, useState } from "react";
import {
  BadgeDollarSign,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/field";
import { clients, expenses, invoices, products, suppliers } from "@/services/mock-data";
import type { Client, Product, Supplier } from "@/types/business";
import { cn, formatCurrency } from "@/lib/utils";
import { roundMoney } from "@/lib/calculations/business";

type InvoiceKind = "venta" | "compra";
type LineKind = "producto" | "gasto";

interface InvoiceLine {
  id: string;
  lineKind: LineKind;
  itemId: string;
  itemName: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  ivaPorcentaje: number;
  retencionPorcentaje: number;
}

interface InvoiceRecord {
  id: string;
  kind: InvoiceKind;
  numeroInterno: string;
  numeroExterno: string;
  partyId: string;
  partyName: string;
  partyDocument: string;
  partyEmail: string;
  partyPhone: string;
  partyAddress: string;
  fecha: string;
  estado: "borrador" | "registrada" | "pagada" | "vencida";
  metodoPago: string;
  notas: string;
  lines: InvoiceLine[];
  subtotal: number;
  ivaTotal: number;
  retencionTotal: number;
  total: number;
}

interface DraftLine {
  lineKind: LineKind;
  itemId: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  ivaPorcentaje: number;
  retencionPorcentaje: number;
}

const demoDate = "2026-05-21";
const paymentOptions = ["efectivo", "transferencia", "tarjeta", "credito"];
const expenseOptions = ["Inventario", "Logistica", "Software", "Servicios", "Hardware", "Otro gasto"];

function lineSubtotal(line: InvoiceLine) {
  return roundMoney(line.cantidad * line.valorUnitario);
}

function lineIva(line: InvoiceLine) {
  return roundMoney(lineSubtotal(line) * (line.ivaPorcentaje / 100));
}

function lineRetencion(line: InvoiceLine) {
  return roundMoney(lineSubtotal(line) * (line.retencionPorcentaje / 100));
}

function lineTotal(line: InvoiceLine) {
  return roundMoney(lineSubtotal(line) + lineIva(line) - lineRetencion(line));
}

function calculateTotals(lines: InvoiceLine[]) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + lineSubtotal(line), 0));
  const ivaTotal = roundMoney(lines.reduce((sum, line) => sum + lineIva(line), 0));
  const retencionTotal = roundMoney(lines.reduce((sum, line) => sum + lineRetencion(line), 0));
  const total = roundMoney(subtotal + ivaTotal - retencionTotal);

  return { subtotal, ivaTotal, retencionTotal, total };
}

function productPrice(product: Product, kind: InvoiceKind) {
  return kind === "venta" ? product.precio_venta : product.costo;
}

function mapSalesStatus(status: string): InvoiceRecord["estado"] {
  if (status === "pagada") return "pagada";
  if (status === "vencida") return "vencida";
  if (status === "borrador" || status === "anulada") return "borrador";
  return "registrada";
}

function seedSales(): InvoiceRecord[] {
  return invoices.map((invoice) => ({
    id: invoice.id,
    kind: "venta",
    numeroInterno: invoice.numero,
    numeroExterno: "",
    partyId: invoice.client_id,
    partyName: invoice.client_name,
    partyDocument: clients.find((client) => client.id === invoice.client_id)?.numero_documento ?? "",
    partyEmail: clients.find((client) => client.id === invoice.client_id)?.email ?? "",
    partyPhone: clients.find((client) => client.id === invoice.client_id)?.telefono ?? "",
    partyAddress: clients.find((client) => client.id === invoice.client_id)?.direccion ?? "",
    fecha: invoice.fecha,
    estado: mapSalesStatus(invoice.estado),
    metodoPago: invoice.metodo_pago,
    notas: invoice.notas,
    lines: invoice.items.map((item) => ({
      id: item.id,
      lineKind: "producto",
      itemId: item.product_id ?? item.id,
      itemName: item.descripcion,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      valorUnitario: item.precio_unitario,
      ivaPorcentaje: item.impuesto_porcentaje,
      retencionPorcentaje: 0,
    })),
    subtotal: invoice.subtotal,
    ivaTotal: invoice.impuesto_total,
    retencionTotal: 0,
    total: invoice.total,
  }));
}

function seedPurchases(): InvoiceRecord[] {
  return expenses.slice(0, 4).map((expense, index) => {
    const supplier = suppliers.find((item) => item.id === expense.supplier_id) ?? suppliers[index % suppliers.length];
    const subtotal = roundMoney(expense.valor);
    const ivaTotal = roundMoney(expense.impuesto);
    const retencionTotal = 0;

    return {
      id: `purchase-${expense.id}`,
      kind: "compra",
      numeroInterno: `FC-${String(2001 + index).padStart(4, "0")}`,
      numeroExterno: `PROV-${String(8001 + index)}`,
      partyId: supplier.id,
      partyName: supplier.nombre,
      partyDocument: supplier.numero_documento,
      partyEmail: supplier.email,
      partyPhone: supplier.telefono,
      partyAddress: supplier.direccion,
      fecha: expense.fecha,
      estado: expense.estado === "pagado" ? "pagada" : expense.estado === "vencido" ? "vencida" : "registrada",
      metodoPago: expense.metodo_pago,
      notas: expense.descripcion,
      lines: [
        {
          id: `purchase-line-${expense.id}`,
          lineKind: "gasto",
          itemId: expense.categoria,
          itemName: expense.categoria,
          descripcion: expense.descripcion,
          cantidad: 1,
          valorUnitario: expense.valor,
          ivaPorcentaje: expense.valor ? roundMoney((expense.impuesto / expense.valor) * 100) : 0,
          retencionPorcentaje: 0,
        },
      ],
      subtotal,
      ivaTotal,
      retencionTotal,
      total: roundMoney(subtotal + ivaTotal - retencionTotal),
    };
  });
}

function nextInternalNumber(kind: InvoiceKind, rows: InvoiceRecord[]) {
  const prefix = kind === "venta" ? "FV" : "FC";
  const base = kind === "venta" ? 1001 : 2001;
  const count = rows.filter((row) => row.kind === kind).length;

  return `${prefix}-${String(base + count).padStart(4, "0")}`;
}

function emptyDraftLine(kind: InvoiceKind): DraftLine {
  const firstProduct = products[0];

  return {
    lineKind: "producto",
    itemId: firstProduct.id,
    descripcion: firstProduct.descripcion,
    cantidad: 1,
    valorUnitario: productPrice(firstProduct, kind),
    ivaPorcentaje: firstProduct.impuesto_porcentaje,
    retencionPorcentaje: 0,
  };
}

function partyLabel(kind: InvoiceKind) {
  return kind === "venta" ? "Cliente" : "Proveedor";
}

function formatPartyDocument(kind: InvoiceKind, party?: Client | Supplier) {
  if (!party) return "";
  return kind === "venta"
    ? `${(party as Client).tipo_documento} ${(party as Client).numero_documento}`
    : `${(party as Supplier).tipo_documento} ${(party as Supplier).numero_documento}`;
}

export function InvoicesPage() {
  const idCounter = useRef(1);
  const [activeKind, setActiveKind] = useState<InvoiceKind>("venta");
  const [rows, setRows] = useState<InvoiceRecord[]>(() => [...seedSales(), ...seedPurchases()]);
  const [showForm, setShowForm] = useState(true);
  const [partyId, setPartyId] = useState(clients[0]?.id ?? "");
  const [numeroExterno, setNumeroExterno] = useState("");
  const [fecha, setFecha] = useState(demoDate);
  const [estado, setEstado] = useState<InvoiceRecord["estado"]>("borrador");
  const [metodoPago, setMetodoPago] = useState(paymentOptions[0]);
  const [notas, setNotas] = useState("");
  const [draftLine, setDraftLine] = useState<DraftLine>(() => emptyDraftLine("venta"));
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [query, setQuery] = useState("");

  const parties = activeKind === "venta" ? clients : suppliers;
  const currentParty = parties.find((party) => party.id === partyId) ?? parties[0];
  const visibleRows = rows.filter((row) => {
    if (row.kind !== activeKind) return false;
    if (!query.trim()) return true;
    const normalized = query.toLowerCase();
    return [row.numeroInterno, row.numeroExterno, row.partyName, row.partyDocument, row.estado]
      .some((value) => value.toLowerCase().includes(normalized));
  });
  const formTotals = useMemo(() => calculateTotals(lines), [lines]);
  const numeroInterno = nextInternalNumber(activeKind, rows);
  const metrics = useMemo(() => {
    const scopedRows = rows.filter((row) => row.kind === activeKind);

    return [
      { label: activeKind === "venta" ? "Ventas" : "Compras", value: String(scopedRows.length), helper: "Registros internos" },
      { label: "IVA", value: formatCurrency(scopedRows.reduce((sum, row) => sum + row.ivaTotal, 0)), helper: "Impuesto calculado" },
      { label: "Total", value: formatCurrency(scopedRows.reduce((sum, row) => sum + row.total, 0)), helper: "Despues de impuestos" },
    ];
  }, [activeKind, rows]);

  function changeKind(kind: InvoiceKind) {
    const nextParties = kind === "venta" ? clients : suppliers;
    setActiveKind(kind);
    setPartyId(nextParties[0]?.id ?? "");
    setNumeroExterno("");
    setEstado("borrador");
    setMetodoPago(paymentOptions[0]);
    setNotas("");
    setDraftLine(emptyDraftLine(kind));
    setLines([]);
    setQuery("");
  }

  function updateLineItem(nextLineKind: LineKind, nextItemId: string) {
    if (nextLineKind === "producto") {
      const product = products.find((item) => item.id === nextItemId) ?? products[0];
      setDraftLine((current) => ({
        ...current,
        lineKind: "producto",
        itemId: product.id,
        descripcion: product.descripcion,
        valorUnitario: productPrice(product, activeKind),
        ivaPorcentaje: product.impuesto_porcentaje,
      }));
      return;
    }

    const expense = expenses.find((item) => item.categoria === nextItemId);
    setDraftLine((current) => ({
      ...current,
      lineKind: "gasto",
      itemId: nextItemId,
      descripcion: expense?.descripcion ?? nextItemId,
      valorUnitario: expense?.valor ?? current.valorUnitario,
      ivaPorcentaje: expense?.valor ? roundMoney((expense.impuesto / expense.valor) * 100) : current.ivaPorcentaje,
    }));
  }

  function addLine() {
    const product = products.find((item) => item.id === draftLine.itemId);
    const itemName = draftLine.lineKind === "producto" ? product?.nombre ?? "Item" : draftLine.itemId;
    const line: InvoiceLine = {
      id: `line-${idCounter.current}`,
      lineKind: draftLine.lineKind,
      itemId: draftLine.itemId,
      itemName,
      descripcion: draftLine.descripcion,
      cantidad: Math.max(1, Number(draftLine.cantidad) || 1),
      valorUnitario: Math.max(0, Number(draftLine.valorUnitario) || 0),
      ivaPorcentaje: Math.max(0, Number(draftLine.ivaPorcentaje) || 0),
      retencionPorcentaje: Math.max(0, Number(draftLine.retencionPorcentaje) || 0),
    };

    idCounter.current += 1;
    setLines((current) => [...current, line]);
    setDraftLine(emptyDraftLine(activeKind));
  }

  function saveInvoice() {
    if (!currentParty || !lines.length) return;

    const totals = calculateTotals(lines);
    const record: InvoiceRecord = {
      id: `${activeKind}-${idCounter.current}`,
      kind: activeKind,
      numeroInterno,
      numeroExterno,
      partyId: currentParty.id,
      partyName: currentParty.nombre,
      partyDocument: formatPartyDocument(activeKind, currentParty),
      partyEmail: currentParty.email,
      partyPhone: currentParty.telefono,
      partyAddress: currentParty.direccion,
      fecha,
      estado,
      metodoPago,
      notas,
      lines,
      ...totals,
    };

    idCounter.current += 1;
    setRows((current) => [record, ...current]);
    setNumeroExterno("");
    setEstado("borrador");
    setMetodoPago(paymentOptions[0]);
    setNotas("");
    setDraftLine(emptyDraftLine(activeKind));
    setLines([]);
    setShowForm(false);
  }

  function removeInvoice(id: string) {
    if (!window.confirm("Eliminar esta factura?")) return;
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Facturas</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Registro interno separado para ventas y compras con impuestos, retenciones y totales calculados.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Ocultar registro" : activeKind === "venta" ? "Nueva venta" : "Nueva compra"}
        </Button>
      </div>

      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
        {(["venta", "compra"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => changeKind(kind)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded px-4 text-sm font-medium text-slate-600 transition",
              activeKind === kind && "bg-teal-700 text-white shadow-sm",
            )}
          >
            {kind === "venta" ? <BadgeDollarSign className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {kind === "venta" ? "Facturas de venta" : "Facturas de compra"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent>
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm ? (
        <Card>
          <CardContent className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Numero interno
                  <Input value={numeroInterno} readOnly />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  {activeKind === "venta" ? "Numero factura venta" : "Numero factura compra"}
                  <Input value={numeroExterno} onChange={(event) => setNumeroExterno(event.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Fecha
                  <Input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  {partyLabel(activeKind)}
                  <Select value={currentParty?.id ?? ""} onChange={(event) => setPartyId(event.target.value)}>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.nombre}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Estado
                  <Select value={estado} onChange={(event) => setEstado(event.target.value as InvoiceRecord["estado"])}>
                    <option value="borrador">borrador</option>
                    <option value="registrada">registrada</option>
                    <option value="pagada">pagada</option>
                    <option value="vencida">vencida</option>
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Metodo pago
                  <Select value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)}>
                    {paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-3">
                  Notas
                  <Textarea value={notas} onChange={(event) => setNotas(event.target.value)} />
                </label>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{partyLabel(activeKind)} seleccionado</p>
                <div className="mt-3 space-y-1">
                  <p>{currentParty?.nombre}</p>
                  <p>{formatPartyDocument(activeKind, currentParty)}</p>
                  <p>{currentParty?.email}</p>
                  <p>{currentParty?.telefono}</p>
                  <p>
                    {currentParty?.direccion}, {currentParty?.ciudad}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Tipo
                  <Select
                    value={draftLine.lineKind}
                    onChange={(event) => updateLineItem(event.target.value as LineKind, event.target.value === "producto" ? products[0].id : expenseOptions[0])}
                  >
                    <option value="producto">Producto/servicio</option>
                    <option value="gasto">Gasto</option>
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 xl:col-span-2">
                  Producto/servicio o gasto
                  <Select value={draftLine.itemId} onChange={(event) => updateLineItem(draftLine.lineKind, event.target.value)}>
                    {draftLine.lineKind === "producto"
                      ? products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.nombre}
                          </option>
                        ))
                      : expenseOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 xl:col-span-2">
                  Descripcion
                  <Input
                    value={draftLine.descripcion}
                    onChange={(event) => setDraftLine((current) => ({ ...current, descripcion: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Cantidad
                  <Input
                    type="number"
                    min={1}
                    value={draftLine.cantidad}
                    onChange={(event) => setDraftLine((current) => ({ ...current, cantidad: Number(event.target.value) }))}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Valor unitario
                  <Input
                    type="number"
                    min={0}
                    value={draftLine.valorUnitario}
                    onChange={(event) => setDraftLine((current) => ({ ...current, valorUnitario: Number(event.target.value) }))}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  IVA %
                  <Input
                    type="number"
                    min={0}
                    value={draftLine.ivaPorcentaje}
                    onChange={(event) => setDraftLine((current) => ({ ...current, ivaPorcentaje: Number(event.target.value) }))}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Retencion %
                  <Input
                    type="number"
                    min={0}
                    value={draftLine.retencionPorcentaje}
                    onChange={(event) => setDraftLine((current) => ({ ...current, retencionPorcentaje: Number(event.target.value) }))}
                  />
                </label>
                <div className="flex items-end">
                  <Button type="button" className="w-full" onClick={addLine}>
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Descripcion</th>
                        <th className="px-4 py-3">Cant.</th>
                        <th className="px-4 py-3">Unitario</th>
                        <th className="px-4 py-3">IVA</th>
                        <th className="px-4 py-3">Retencion</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-3 text-slate-700">{line.itemName}</td>
                          <td className="max-w-[280px] px-4 py-3 text-slate-700">
                            <span className="line-clamp-2">{line.descripcion}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{line.cantidad}</td>
                          <td className="px-4 py-3 text-slate-700">{formatCurrency(line.valorUnitario)}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {line.ivaPorcentaje}% / {formatCurrency(lineIva(line))}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {line.retencionPorcentaje}% / {formatCurrency(lineRetencion(line))}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(lineTotal(line))}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Button size="icon" variant="ghost" aria-label="Quitar linea" onClick={() => removeLine(line.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!lines.length ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">Agrega al menos una linea para registrar la factura.</div>
                ) : null}
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(formTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA calculado</span>
                    <span className="font-medium text-slate-900">{formatCurrency(formTotals.ivaTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Retencion calculada</span>
                    <span className="font-medium text-slate-900">-{formatCurrency(formTotals.retencionTotal)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-base font-semibold text-slate-950">
                      <span>Total final</span>
                      <span>{formatCurrency(formTotals.total)}</span>
                    </div>
                  </div>
                </div>
                <Button type="button" className="mt-4 w-full" disabled={!lines.length} onClick={saveInvoice}>
                  Guardar factura
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Interno</th>
                    <th className="px-4 py-3">{activeKind === "venta" ? "Factura venta" : "Factura compra"}</th>
                    <th className="px-4 py-3">{partyLabel(activeKind)}</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3">IVA</th>
                    <th className="px-4 py-3">Retencion</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.numeroInterno}</td>
                      <td className="px-4 py-3 text-slate-700">{row.numeroExterno || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{row.partyName}</div>
                        <div className="text-xs text-slate-500">{row.partyDocument}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(row.subtotal)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(row.ivaTotal)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(row.retencionTotal)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.total)}</td>
                      <td className="px-4 py-3">
                        <Badge value={row.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" aria-label="Eliminar factura" onClick={() => removeInvoice(row.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!visibleRows.length ? (
              <div className="px-4 py-12 text-center text-sm text-slate-500">
                Sin facturas de {activeKind} para los filtros actuales.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
