import { logger } from '../../utils/logger';
import { odooRpc } from './odooClient';

export interface PartnerData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
}

export async function fetchPartner(partnerId: number): Promise<PartnerData> {
  const result = await odooRpc<PartnerData[]>(
    '/web/dataset/call_kw',
    {
      model: 'res.partner',
      method: 'read',
      args: [[partnerId]],
      kwargs: {
        fields: ['id', 'name', 'email', 'phone'], // ← quitamos mobile
      },
    }
  );

  if (!result || result.length === 0) {
    throw new Error('No se encontraron datos del cliente');
  }

  logger.log('Partner fetched', { partnerId });
  return result[0];
}