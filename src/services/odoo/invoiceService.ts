// invoiceService.ts
// Consulta facturas reales del cliente autenticado en Odoo.
// Modelo: account.move — el modelo estándar de facturas en Odoo.

import { OdooInvoice } from '../../types/odoo.types';
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

// Calcula resumen financiero desde las facturas
export function calculateSummary(invoices: OdooInvoice[]) {
  const totalPending = invoices
    .filter(inv => inv.payment_state !== 'paid')
    .reduce((sum, inv) => sum + inv.amount_residual, 0);

  const totalPaid = invoices
    .filter(inv => inv.payment_state === 'paid')
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  // Saldo a favor = pagos en exceso (amount_residual negativo)
  const totalCredit = invoices
    .filter(inv => inv.amount_residual < 0)
    .reduce((sum, inv) => sum + Math.abs(inv.amount_residual), 0);

  return { totalPending, totalPaid, totalCredit };
}

// Formatea moneda de forma consistente en toda la app
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}