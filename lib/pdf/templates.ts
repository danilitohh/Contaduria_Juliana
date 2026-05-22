"use client";

import { jsPDF } from "jspdf";
import type { CompanySettings, DocumentItem, Employee, Invoice, Payment, Payroll, Quote } from "@/types/business";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PdfParty {
  name: string;
  email?: string;
  document?: string;
  phone?: string;
}

interface PdfDocument {
  title: string;
  number: string;
  date: string;
  dueDate?: string;
  customer?: PdfParty;
  items: DocumentItem[];
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  notes?: string;
  terms?: string;
  legalNotice?: string;
}

function addHeader(doc: jsPDF, company: CompanySettings, title: string, number: string) {
  doc.setFillColor(company.color_marca || "#0f766e");
  doc.rect(0, 0, 595, 84, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(company.nombre_empresa, 42, 36);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${company.identificacion} | ${company.email} | ${company.telefono}`, 42, 56);
  doc.text(`${company.direccion}, ${company.ciudad}, ${company.pais}`, 42, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 430, 36);
  doc.setFontSize(11);
  doc.text(number, 430, 56);
  doc.setTextColor("#172033");
}

function addPartyAndDates(doc: jsPDF, document: PdfDocument) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Cliente", 42, 118);
  doc.setFont("helvetica", "normal");
  doc.text(document.customer?.name ?? "Consumidor final", 42, 136);
  doc.text(document.customer?.email ?? "Sin correo registrado", 42, 152);
  doc.text(document.customer?.document ?? "Documento no informado", 42, 168);

  doc.setFont("helvetica", "bold");
  doc.text("Fechas", 390, 118);
  doc.setFont("helvetica", "normal");
  doc.text(`Emision: ${formatDate(document.date)}`, 390, 136);
  if (document.dueDate) {
    doc.text(`Vence: ${formatDate(document.dueDate)}`, 390, 152);
  }
}

function addItems(doc: jsPDF, items: DocumentItem[], startY: number) {
  let y = startY;
  doc.setFillColor("#eef4f2");
  doc.rect(42, y, 512, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Descripcion", 50, y + 16);
  doc.text("Cant.", 300, y + 16);
  doc.text("Precio", 350, y + 16);
  doc.text("Imp.", 430, y + 16);
  doc.text("Total", 492, y + 16);

  y += 34;
  doc.setFont("helvetica", "normal");
  items.forEach((item) => {
    const description = doc.splitTextToSize(item.descripcion, 220) as string[];
    doc.text(description, 50, y);
    doc.text(String(item.cantidad), 304, y);
    doc.text(formatCurrency(item.precio_unitario), 350, y);
    doc.text(`${item.impuesto_porcentaje}%`, 430, y);
    doc.text(formatCurrency(item.total_linea), 492, y);
    y += Math.max(24, description.length * 12);
  });

  return y + 12;
}

function addTotals(doc: jsPDF, document: PdfDocument, y: number) {
  const rows = [
    ["Subtotal", document.subtotal],
    ["Descuento", document.discount],
    ["Impuestos", document.taxes],
    ["Total", document.total],
  ] as const;

  rows.forEach(([label, value], index) => {
    const currentY = y + index * 20;
    doc.setFont("helvetica", index === rows.length - 1 ? "bold" : "normal");
    doc.text(label, 382, currentY);
    doc.text(formatCurrency(value), 492, currentY);
  });

  return y + rows.length * 22;
}

function addFooter(doc: jsPDF, document: PdfDocument, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (document.notes) {
    doc.text("Notas", 42, y);
    doc.text(doc.splitTextToSize(document.notes, 250) as string[], 42, y + 14);
  }
  if (document.terms) {
    doc.text("Terminos", 42, y + 56);
    doc.text(doc.splitTextToSize(document.terms, 250) as string[], 42, y + 70);
  }
  if (document.legalNotice) {
    doc.setTextColor("#b45309");
    doc.text(doc.splitTextToSize(document.legalNotice, 500) as string[], 42, 804);
    doc.setTextColor("#172033");
  }
}

function buildBaseDocument(company: CompanySettings, document: PdfDocument) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, company, document.title, document.number);
  addPartyAndDates(doc, document);
  const itemsEnd = addItems(doc, document.items, 205);
  const totalsEnd = addTotals(doc, document, Math.max(itemsEnd, 470));
  addFooter(doc, document, totalsEnd + 16);
  return doc;
}

export function downloadQuotePdf(company: CompanySettings, quote: Quote) {
  const doc = buildBaseDocument(company, {
    title: "Cotizacion",
    number: quote.numero,
    date: quote.fecha,
    dueDate: quote.fecha_vencimiento,
    customer: { name: quote.client_name },
    items: quote.items,
    subtotal: quote.subtotal,
    discount: quote.descuento_total,
    taxes: quote.impuesto_total,
    total: quote.total,
    notes: quote.notas,
    terms: quote.terminos_condiciones,
  });

  doc.save(`${quote.numero}.pdf`);
}

export function downloadInvoicePdf(company: CompanySettings, invoice: Invoice) {
  const doc = buildBaseDocument(company, {
    title: "Factura interna",
    number: invoice.numero,
    date: invoice.fecha,
    dueDate: invoice.fecha_vencimiento,
    customer: { name: invoice.client_name },
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.descuento_total,
    taxes: invoice.impuesto_total,
    total: invoice.total,
    notes: invoice.notas,
    legalNotice: "Documento interno. No valido como factura electronica DIAN.",
  });

  doc.save(`${invoice.numero}.pdf`);
}

export function downloadReceiptPdf(company: CompanySettings, payment: Payment) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, company, "Recibo de pago", payment.referencia || payment.id);
  doc.setFontSize(12);
  doc.text(`Cliente: ${payment.client_name}`, 42, 130);
  doc.text(`Factura: ${payment.invoice_number}`, 42, 154);
  doc.text(`Fecha: ${formatDate(payment.fecha)}`, 42, 178);
  doc.text(`Metodo: ${payment.metodo_pago}`, 42, 202);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`Valor recibido: ${formatCurrency(payment.valor)}`, 42, 250);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(payment.notas || "Pago registrado en Nexo Admin.", 42, 292);
  doc.save(`recibo-${payment.referencia || payment.id}.pdf`);
}

export function downloadPayrollPdf(company: CompanySettings, payroll: Payroll, employee?: Employee) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, company, "Comprobante de nomina", payroll.periodo);
  doc.setFontSize(12);
  doc.text(`Empleado: ${payroll.employee_name}`, 42, 130);
  doc.text(`Documento: ${employee?.documento ?? "No informado"}`, 42, 154);
  doc.text(`Cargo: ${employee?.cargo ?? "No informado"}`, 42, 178);
  doc.text(`Dias trabajados: ${payroll.dias_trabajados}`, 42, 220);
  doc.text(`Horas extra: ${formatCurrency(payroll.horas_extra)}`, 42, 244);
  doc.text(`Bonificaciones: ${formatCurrency(payroll.bonificaciones)}`, 42, 268);
  doc.text(`Deducciones: ${formatCurrency(payroll.deducciones)}`, 42, 292);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`Total pagado: ${formatCurrency(payroll.total_pagado)}`, 42, 340);
  doc.save(`nomina-${payroll.periodo}-${payroll.employee_name}.pdf`);
}
