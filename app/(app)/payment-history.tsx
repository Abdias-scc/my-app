import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
    ActivityIndicator, RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InvoiceItem } from '../../src/components/ui/InvoiceItem';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useInvoices } from '../../src/hooks/useInvoices';
import { formatCurrency } from '../../src/services/odoo/invoiceService';

export default function PaymentHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { invoices, loading, refresh } = useInvoices(user?.partnerId ?? null);

  // Solo facturas pagadas
  const paidInvoices = invoices.filter(inv => inv.payment_state === 'paid');

  // Total pagado
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount_total, 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de pagos</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Resumen total */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL PAGADO</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalPaid)}</Text>
        <Text style={styles.summaryCount}>
          {paidInvoices.length} {paidInvoices.length === 1 ? 'factura' : 'facturas'} pagadas
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading && paidInvoices.length === 0 && (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        )}

        {!loading && paidInvoices.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No tienes pagos registrados aún</Text>
          </View>
        )}

        {paidInvoices.map((invoice) => (
          <InvoiceItem
            key={invoice.id}
            invoice={invoice}
            expanded
          />
        ))}
      </ScrollView>
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
  summaryCard: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginVertical: SPACING.xs,
  },
  summaryCount: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  scroll: { flex: 1, marginTop: SPACING.sm },
  scrollContent: { paddingBottom: SPACING.xl },
  emptyBox: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.text.placeholder,
    fontSize: FONTS.sizes.md,
  },
});