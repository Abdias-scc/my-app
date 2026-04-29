import { ODOO_CONFIG } from '../../constants/config';
import { OdooJsonRpcResponse } from '../../types/odoo.types';
import { logger } from '../../utils/logger';

let requestId = 0;

export async function odooRpc<T>(
  endpoint: string,
  params: Record<string, unknown>
): Promise<T> {

  const url = `${ODOO_CONFIG.baseUrl}${endpoint}`;
  requestId += 1;

  const body = {
    jsonrpc: '2.0',
    method: 'call',
    id: requestId,
    params,
  };

  logger.log(`RPC → ${endpoint}`, params);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: OdooJsonRpcResponse<T> = await response.json();

  logger.log(`RPC ← ${endpoint}`, data);

  if (data.error) {
    const msg = data.error.data?.message ?? data.error.message;
    throw new Error(msg);
  }

  return data.result as T;
}