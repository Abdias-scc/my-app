import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    Download,
    FileText,
    Upload
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { downloadInvoicePdf, fetchInvoiceDetail, formatCurrency } from '../../src/services/odoo/invoiceService';
import { OdooInvoiceDetail } from '../../src/types/odoo.types';

// Configuración de colores según estado de pago
const PAYMENT_STATE_CONFIG = {
  not_paid: { label: 'Pendiente', color: '#E74C3C', bg: '#FDECEA' },
  paid: { label: 'Pagado', color: COLORS.primary, bg: COLORS.primarySurface },
  partial: { label: 'Parcial', color: '#F39C12', bg: '#FEF9EC' },
  in_payment: { label: 'En proceso', color: '#2980B9', bg: '#EBF5FB' },
  reversed: { label: 'Anulado', color: '#7F8C8D', bg: '#F5F5F5' },
};

const VOUCHER_STATE_CONFIG = {
  none: null,
  pending_review: { label: 'Comprobante en revisión', color: '#F39C12', bg: '#FEF9EC' },
  approved: { label: 'Comprobante aprobado', color: COLORS.primary, bg: COLORS.primarySurface },
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<OdooInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchInvoiceDetail(Number(id))
      .then(setInvoice)
      .catch(() => setError('No se pudo cargar el detalle de la factura'))
      .finally(() => setLoading(false));
  }, [id]);

  const paymentConfig = invoice
    ? PAYMENT_STATE_CONFIG[invoice.payment_state as keyof typeof PAYMENT_STATE_CONFIG]
    ?? PAYMENT_STATE_CONFIG.not_paid
    : null;

  const voucherConfig = invoice?.mobile_voucher_state
    ? VOUCHER_STATE_CONFIG[invoice.mobile_voucher_state]
    : null;

  const isPending = invoice?.payment_state !== 'paid';

// Estado para el botón
const [downloading, setDownloading] = useState(false);

    function showModal(arg0: string, arg1: string, message: string) {
        throw new Error('Function not implemented.');
    }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle de factura</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : invoice ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <TouchableOpacity
        style={styles.downloadBtn}
        onPress={async () => {
            if (!invoice) return;
            setDownloading(true);
            try {
            await downloadInvoicePdf(invoice.id, invoice.name);
            } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al descargar';
            showModal('error', 'Error al descargar', message);
            } finally {
            setDownloading(false);
            }
        }}
        disabled={downloading}
        activeOpacity={0.85}
        >
        {downloading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
            <>
            <Download size={16} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.downloadBtnText}>Descargar factura PDF</Text>
            </>
        )}
        </TouchableOpacity>

          {/* Card principal — número y estado */}
          <View style={styles.card}>
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceIconWrap}>
                <FileText size={20} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.invoiceHeaderInfo}>
                <Text style={styles.invoiceName}>{invoice.name}</Text>
                <Text style={styles.invoicePartner}>
                  {Array.isArray(invoice.partner_id)
                    ? invoice.partner_id[1]
                    : invoice.partner_id}
                </Text>
              </View>
              {paymentConfig && (
                <View style={[styles.badge, { backgroundColor: paymentConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: paymentConfig.color }]}>
                    {paymentConfig.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Estado del comprobante */}
            {voucherConfig && (
              <View style={[styles.voucherBanner, { backgroundColor: voucherConfig.bg }]}>
                <CheckCircle size={14} color={voucherConfig.color} strokeWidth={2} />
                <Text style={[styles.voucherBannerText, { color: voucherConfig.color }]}>
                  {voucherConfig.label}
                </Text>
              </View>
            )}
          </View>

          {/* Fechas */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fechas</Text>
            <View style={styles.datesRow}>
              <View style={styles.dateItem}>
                <View style={styles.dateIconWrap}>
                  <Calendar size={14} color={COLORS.primary} strokeWidth={2} />
                </View>
                <Text style={styles.dateLabel}>Emitida</Text>
                <Text style={styles.dateValue}>{invoice.invoice_date}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateItem}>
                <View style={styles.dateIconWrap}>
                  <Clock size={14} color="#E74C3C" strokeWidth={2} />
                </View>
                <Text style={styles.dateLabel}>Vence</Text>
                <Text style={[
                  styles.dateValue,
                  invoice.payment_state !== 'paid' && { color: '#E74C3C' },
                ]}>
                  {invoice.invoice_date_due}
                </Text>
              </View>
            </View>
          </View>

          {/* Líneas de factura — productos */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Productos / Servicios</Text>
            {invoice.lines.map((line, index) => (
              <View
                key={line.id}
                style={[
                  styles.lineItem,
                  index < invoice.lines.length - 1 && styles.lineItemBorder,
                ]}
              >
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{line.name}</Text>
                  <Text style={styles.lineQty}>
                    {line.quantity} × {formatCurrency(line.price_unit)}
                  </Text>
                </View>
                <Text style={styles.lineTotal}>
                  {formatCurrency(line.price_total)}
                </Text>
              </View>
            ))}
          </View>

          {/* Resumen de montos */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resumen</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.amount_untaxed)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Impuestos</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.amount_tax)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(invoice.amount_total)}
              </Text>
            </View>

            {invoice.amount_residual > 0 && (
              <View style={[styles.summaryRow, styles.summaryPending]}>
                <Text style={styles.summaryPendingLabel}>Saldo pendiente</Text>
                <Text style={styles.summaryPendingValue}>
                  {formatCurrency(invoice.amount_residual)}
                </Text>
              </View>
            )}
          </View>

            {invoice.narration && typeof invoice.narration === 'string' ? (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <Text style={styles.narration}>{invoice.narration}</Text>
            </View>
            ) : null}

          {/* Botón subir comprobante */}
          {isPending && invoice.mobile_voucher_state !== 'pending_review' && (
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => router.push(`/(app)/upload?invoiceId=${invoice.id}` as Href)}
              activeOpacity={0.85}
            >
              <Upload size={16} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.uploadBtnText}>Subir comprobante</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      ) : null}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primarySurface },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  invoiceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceHeaderInfo: { flex: 1 },
  invoiceName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  invoicePartner: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  voucherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  voucherBannerText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dateIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
  },
  dateValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  dateDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.borderLight,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  lineItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  lineInfo: { flex: 1 },
  lineName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  lineQty: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
    marginTop: 2,
  },
  lineTotal: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  summaryTotalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryPending: {
    backgroundColor: '#FDECEA',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.xs,
  },
  summaryPendingLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: '#E74C3C',
  },
  summaryPendingValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: '#E74C3C',
  },
  narration: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  uploadBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  downloadBtn: {
  backgroundColor: COLORS.white,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.md,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: SPACING.sm,
  borderWidth: 1.5,
  borderColor: COLORS.primary,
  ...SHADOWS.sm,
},
downloadBtnText: {
  color: COLORS.primary,
  fontSize: FONTS.sizes.md,
  fontWeight: '700',
},
});