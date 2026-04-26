// InvoiceItem.tsx
// Tarjeta de factura individual.
// Se usa tanto en el dashboard (versión compacta) como en la
// pantalla de facturas (versión expandida con botón de subir).

import { useRouter } from 'expo-router';
import { FileCheck, FilePlus, FileText, Upload } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import { OdooInvoice } from '../../types';
  
interface InvoiceItemProps {
  invoice: OdooInvoice;
  expanded?: boolean;        // true = muestra detalle y botón subir
  onUpload?: () => void;     // callback cuando presiona subir comprobante
  onPress?: () => void;
}

// Configuración visual según estado de pago
const STATE_CONFIG = {
  not_paid: {
    label: 'Pendiente',
    color: '#E74C3C',
    bgColor: '#FDECEA',
    Icon: FileText,
  },
  paid: {
    label: 'Pagado',
    color: COLORS.primary,
    bgColor: COLORS.primarySurface,
    Icon: FileCheck,
  },
  partial: {
    label: 'Parcial',
    color: '#F39C12',
    bgColor: '#FEF9EC',
    Icon: FilePlus,
  },
  in_payment: {
    label: 'En proceso',
    color: '#2980B9',
    bgColor: '#EBF5FB',
    Icon: FilePlus,
  },
  reversed: {
    label: 'Anulada',
    color: '#7F8C8D',
    bgColor: '#F5F5F5',
    Icon: FileText,
  },
} as const;

// Formatea números como moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function InvoiceItem({
  invoice,
  expanded = false,
  onUpload,
  onPress,
}: InvoiceItemProps) {

  const router = useRouter();

  const state = STATE_CONFIG[invoice.payment_state as keyof typeof STATE_CONFIG]
    ?? STATE_CONFIG.not_paid;

  const { Icon } = state;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/(app)/invoice-detail?id=${invoice.id}`)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>
        {/* Ícono de estado */}
        <View style={[styles.iconWrap, { backgroundColor: state.bgColor }]}>
          <Icon size={14} color={state.color} strokeWidth={2} />
        </View>

        {/* Info principal */}
        <View style={styles.info}>
          <Text style={styles.name}>{invoice.name}</Text>
          <Text style={styles.date}>
            {invoice.payment_state === 'paid'
              ? `Pagado ${invoice.invoice_date}`
              : `Vence ${invoice.invoice_date_due}`}
          </Text>
          <View style={[styles.badge, { backgroundColor: state.bgColor }]}>
            <Text style={[styles.badgeText, { color: state.color }]}>
              {state.label}
            </Text>
          </View>
          {invoice.mobile_voucher_state === 'pending_review' && (
          <View style={[styles.badge, { backgroundColor: '#EBF5FB' }]}>
            <Text style={[styles.badgeText, { color: '#2980B9' }]}>
              En revisión
            </Text>
          </View>
          )}
        </View>
        

        {/* Monto */}
        <Text style={[styles.amount, { color: state.color }]}>
          {formatCurrency(invoice.amount_residual > 0
            ? invoice.amount_residual
            : invoice.amount_total)}
        </Text>
      </View>

      {/* Sección expandida — solo en pantalla de facturas */}
      {expanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Emitida</Text>
              <Text style={styles.metaValue}>{invoice.invoice_date}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Vence</Text>
              <Text style={styles.metaValue}>{invoice.invoice_date_due}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.metaValue}>
                {formatCurrency(invoice.amount_total)}
              </Text>
            </View>
          </View>

          {/* Botón subir comprobante — solo en facturas pendientes */}
          {invoice.payment_state === 'not_paid' && onUpload && (
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={onUpload}
              activeOpacity={0.85}
            >
              <Upload size={12} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.uploadText}>Subir comprobante</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  amount: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
  },
  metaValue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  uploadText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});