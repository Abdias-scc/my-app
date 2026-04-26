// invoiceService.ts
// Consulta facturas reales del cliente autenticado en Odoo.
// Modelo: account.move — el modelo estándar de facturas en Odoo.

import { OdooInvoice, OdooInvoiceDetail, OdooInvoiceLine } from '../../types/odoo.types';
import { logger } from '../../utils/logger';
import { odooRpc } from './odooClient';

// Campos exactos que pedimos a Odoo
// Solo pedimos lo que necesitamos — buena práctica de performance
const INVOICE_FIELDS = [
  'id',
  'name',
  'state',
  'payment_state',
  'amount_total',
  'amount_residual',
  'invoice_date',
  'invoice_date_due',
  'partner_id',
  'mobile_voucher_state', // ← NUEVO
];

export async function fetchInvoices(partnerId: number): Promise<OdooInvoice[]> {
  // partnerId = el ID del contacto del usuario autenticado
  // Lo obtenemos de la sesión — así cada cliente ve SOLO sus facturas

  const result = await odooRpc<OdooInvoice[]>(
    '/web/dataset/call_kw',
    {
      model: 'account.move',
      method: 'search_read',
      args: [],
      kwargs: {
        domain: [
          ['partner_id', '=', partnerId],
          ['move_type', '=', 'out_invoice'],
          ['state', '=', 'posted'],
        ],
        // domain = filtros:
        // 1. Solo facturas de este cliente
        // 2. Solo facturas de cliente (no de proveedor)
        // 3. Solo facturas confirmadas (no borradores)
        fields: INVOICE_FIELDS,
        order: 'invoice_date_due asc',
        // Ordenamos por fecha de vencimiento — las más urgentes primero
      },
    }
  );

  logger.log('Invoices fetched', { count: result.length, partnerId });
  return result;
}
// Obtiene el detalle completo de una factura incluyendo sus líneas
export async function fetchInvoiceDetail(
  invoiceId: number
): Promise<OdooInvoiceDetail> {

  // Paso 1 — Leer datos generales de la factura
  const invoices = await odooRpc<OdooInvoiceDetail[]>(
    '/web/dataset/call_kw',
    {
      model: 'account.move',
      method: 'read',
      args: [[invoiceId]],
      kwargs: {
        fields: [
          ...INVOICE_FIELDS,
          'invoice_line_ids',
          'amount_untaxed',
          'amount_tax',
          'narration',
          'currency_id',
        ],
      },
    }
  );

  if (!invoices || invoices.length === 0) {
    throw new Error('Factura no encontrada');
  }

  const invoice = invoices[0];

  // Paso 2 — Leer las líneas de la factura
  // Filtramos solo líneas con producto (excluye secciones y notas)
  const lines = await odooRpc<OdooInvoiceLine[]>(
    '/web/dataset/call_kw',
    {
      model: 'account.move.line',
      method: 'search_read',
      args: [],
      kwargs: {
        domain: [
          ['move_id', '=', invoiceId],
          ['display_type', '=', 'product'],
          // display_type = 'product' excluye secciones y subtotales
        ],
        fields: [
          'id',
          'name',
          'quantity',
          'price_unit',
          'price_subtotal',
          'price_total',
        ],
      },
    }
  );

  logger.log('Invoice detail fetched', { invoiceId, lines: lines.length });

  return { ...invoice, lines };
}

export function calculateSummary(invoices: OdooInvoice[]) {
  const totalPending = invoices
    .filter(inv => inv.payment_state !== 'paid')
    .reduce((sum, inv) => sum + inv.amount_residual, 0);

  const totalPaid = invoices
    .filter(inv => inv.payment_state === 'paid')
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  const totalCredit = invoices
    .filter(inv => inv.amount_residual < 0)
    .reduce((sum, inv) => sum + Math.abs(inv.amount_residual), 0);

  return { totalPending, totalPaid, totalCredit };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}