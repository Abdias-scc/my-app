// useInvoices.ts
// Hook que maneja el estado de las facturas.
// Separa la lógica de la UI — el dashboard solo muestra datos,
// este hook se encarga de pedirlos y manejar estados de carga.

import { useCallback, useEffect, useState } from 'react';
import { calculateSummary, fetchInvoices } from '../services/odoo/invoiceService';
import { OdooInvoice } from '../types/odoo.types';
import { logger } from '../utils/logger';

interface InvoiceSummary {
  totalPending: number;
  totalPaid: number;
  totalCredit: number;
}

interface UseInvoicesReturn {
  invoices: OdooInvoice[];
  summary: InvoiceSummary;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useInvoices(partnerId: number | null): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<OdooInvoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary>({
    totalPending: 0,
    totalPaid: 0,
    totalCredit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!partnerId) return;
    // Si no hay partnerId todavía, esperamos

    setLoading(true);
    setError(null);

    try {
      const data = await fetchInvoices(partnerId);
      setInvoices(data);
      setSummary(calculateSummary(data));
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Error al cargar facturas';
      setError(message);
      logger.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { invoices, summary, loading, error, refresh: load };
}