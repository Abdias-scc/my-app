// src/types/odoo.types.ts
// Contratos TypeScript para todos los datos que vienen de Odoo.
// Si Odoo devuelve algo diferente a lo que definimos aquí,
// TypeScript nos avisa ANTES de que falle en producción.

// Estructura base de cualquier respuesta JSON-RPC
export interface OdooJsonRpcResponse<T> {
  jsonrpc: string;
  id: number | null;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: { message: string };
  };
}

export interface OdooSession {
  uid: number;
  name: string;
  partner_id: number;
  session_id: string;
  db: string;
}

export interface OdooInvoice {
  id: number;
  name: string;
  state: 'draft' | 'posted' | 'cancel';
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed';
  amount_total: number;
  amount_residual: number;
  invoice_date: string;
  invoice_date_due: string;
  partner_id: [number, string];
  mobile_voucher_state?: 'none' | 'pending_review' | 'approved';
}

// Línea individual de factura (producto)
export interface OdooInvoiceLine {
  id: number;
  name: string;           // Nombre del producto/servicio
  quantity: number;       // Cantidad
  price_unit: number;     // Precio unitario
  price_subtotal: number; // Subtotal sin impuestos
  price_total: number;    // Total con impuestos
}

// Detalle completo de una factura
export interface OdooInvoiceDetail extends OdooInvoice {
  invoice_line_ids: number[];
  lines: OdooInvoiceLine[];
  amount_untaxed: number;  // Subtotal sin impuestos
  amount_tax: number;      // Total impuestos
  narration: string;       // Notas de la factura
  currency_id: [number, string]; // [id, símbolo]
}