import { logger } from '../../utils/logger';
import { odooRpc } from './odooClient';

interface UploadVoucherParams {
  invoiceId: number;
  invoiceName: string;
  partnerId: number;
  imageBase64: string;
  fileName: string;
  mimeType: string;
}

interface UploadResult {
  attachmentId: number;
  success: boolean;
}

export async function uploadVoucher(
  params: UploadVoucherParams
): Promise<UploadResult> {

  const { invoiceId, imageBase64, fileName, mimeType } = params;

  // Ahora llamamos a nuestro controlador propio en Odoo
  // que usa sudo() internamente con verificación de seguridad
  const result = await odooRpc<{
    success: boolean;
    attachment_id?: number;
    error?: string;
  }>(
    '/mobile/upload_voucher',
    {
      invoice_id: invoiceId,
      image_base64: imageBase64,
      file_name: fileName,
      mime_type: mimeType,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Error al subir el comprobante');
  }

  logger.log('Voucher uploaded', { attachmentId: result.attachment_id });

  return {
    attachmentId: result.attachment_id ?? 0,
    success: true,
  };
}