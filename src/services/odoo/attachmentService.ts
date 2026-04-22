// attachmentService.ts
// Sube comprobantes de pago a Odoo como ir.attachment.
// Convierte la imagen a base64 y la envía via JSON-RPC.

import { logger } from '../../utils/logger';
import { odooRpc } from './odooClient';

interface UploadVoucherParams {
  invoiceId: number;      // ID de la factura en Odoo
  invoiceName: string;    // Nombre de la factura (INV/2024/0042)
  partnerId: number;      // ID del cliente
  imageBase64: string;    // Imagen en base64 SIN el prefijo data:image/...
  fileName: string;       // Nombre del archivo (comprobante.jpg)
  mimeType: string;       // image/jpeg o image/png
}

interface UploadResult {
  attachmentId: number;
  success: boolean;
}

export async function uploadVoucher(
  params: UploadVoucherParams
): Promise<UploadResult> {

  const {
    invoiceId,
    invoiceName,
    partnerId,
    imageBase64,
    fileName,
    mimeType,
  } = params;

  // Paso 1 — Crear el adjunto en ir.attachment
  // Odoo guarda archivos como registros en ir.attachment
  // vinculados a cualquier modelo mediante res_model y res_id
  const attachmentId = await odooRpc<number>(
    '/web/dataset/call_kw',
    {
      model: 'ir.attachment',
      method: 'create',
      args: [
        {
          name: fileName,
          datas: imageBase64,
          // datas = contenido del archivo en base64
          // Odoo espera base64 puro, sin el prefijo "data:image/..."

          res_model: 'account.move',
          // res_model = modelo al que pertenece este adjunto

          res_id: invoiceId,
          // res_id = ID del registro específico (la factura)

          mimetype: mimeType,
          description: `Comprobante de pago — ${invoiceName}`,
        },
      ],
      kwargs: {},
    }
  );

  logger.log('Attachment created', { attachmentId, invoiceId });

  // Paso 2 — Registrar en nuestro modelo custom (si está instalado)
  // Si el módulo custom_mobile_portal está instalado, creamos
  // también un registro en customer.payment.voucher
  try {
    await odooRpc('/web/dataset/call_kw', {
      model: 'customer.payment.voucher',
      method: 'create',
      args: [
        {
          partner_id: partnerId,
          invoice_id: invoiceId,
          attachment_id: attachmentId,
          state: 'pending',
        },
      ],
      kwargs: {},
    });
    logger.log('Voucher record created');
  } catch {
    // Si el módulo no está instalado, ignoramos silenciosamente
    // El adjunto ya fue creado en Odoo de todas formas
    logger.warn('custom_mobile_portal not installed, skipping voucher record');
  }

  return { attachmentId, success: true };
}