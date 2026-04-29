import { logger } from '../../utils/logger';
import { odooRpc } from './odooClient';

export interface PaymentMethod {
  id: number;
  name: string;
  type: 'bank' | 'cash';
  bank_info?: {
    account_number: string;
    bank_name: string;
    account_holder: string;
  } | null;
}

export interface RegisterPaymentParams {
  invoiceId: number;
  journalId: number;
  amount: number;
  memo?: string;
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const result = await odooRpc<PaymentMethod[]>(
    '/mobile/payment_methods',
    {}
  );
  logger.log('Payment methods fetched', { count: result.length });
  return result;
}

export async function registerPayment(
  params: RegisterPaymentParams
): Promise<{ success: boolean; paymentId?: number; message?: string }> {

  const result = await odooRpc<{
    success: boolean;
    payment_id?: number;
    message?: string;
    error?: string;
  }>(
    '/mobile/register_payment',
    {
      invoice_id: params.invoiceId,
      journal_id: params.journalId,
      amount: params.amount,
      memo: params.memo,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Error al registrar el pago');
  }

  logger.log('Payment registered', { paymentId: result.payment_id });
  return {
    success: true,
    paymentId: result.payment_id,
    message: result.message,
  };
}