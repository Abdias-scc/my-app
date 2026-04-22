// src/types/odoo.types.ts
// Contratos TypeScript para todos los datos que vienen de Odoo.
// Si Odoo devuelve algo diferente a lo que definimos aquí,
// TypeScript nos avisa ANTES de que falle en producción.

// Estructura base de cualquier respuesta JSON-RPC
export interface OdooJsonRpcResponse<T> {
  jsonrpc: string;   // Siempre "2.0"
  id: number | null;
  result?: T;        // Datos reales si todo salió bien
  error?: {
    code: number;
    message: string;
    data?: { message: string };
  };
}

// Datos que devuelve Odoo al autenticarse correctamente
export interface OdooSession {
  uid: number;        // ID numérico del usuario: 7
  name: string;       // Nombre: "Juan Pérez"
  partner_id: number; // ID del contacto vinculado
  session_id: string; // Cookie de sesión
  db: string;         // Base de datos
}

// Factura de cliente (modelo account.move)
export interface OdooInvoice {
  id: number;
  name: string;            // "INV/2024/0001"
  state: 'draft' | 'posted' | 'cancel';
  payment_state: 'not_paid' | 'in_payment' | 'paid' | 'partial' | 'reversed';
  amount_total: number;    // Total de la factura
  amount_residual: number; // Saldo pendiente (0 si está pagada)
  invoice_date: string;    // "2024-01-15"
  invoice_date_due: string;// "2024-02-15"
  partner_id: [number, string]; // [42, "Juan Pérez"] — así devuelve Odoo los Many2one
}