import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator, RefreshControl,
  ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { InvoiceItem } from '../../src/components/ui/InvoiceItem';
import { StatCard } from '../../src/components/ui/StatCard';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useInvoices } from '../../src/hooks/useInvoices';
import { formatCurrency } from '../../src/services/odoo/invoiceService';

const router = useRouter();

export default function DashboardScreen() {
  const { user } = useAuth();
  const { invoices, summary, loading, error, refresh } = useInvoices(
    user?.partnerId ?? null
  );

  const firstName = user?.name?.split(' ')[0] ?? 'Cliente';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header ─────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido de nuevo</Text>
          <Text style={styles.username}>{user?.name ?? '...'}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* ── Tarjetas resumen ────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard
          label="Por pagar"
          amount={formatCurrency(summary.totalPending)}
          type="danger"
        />
        <StatCard
          label="Pagado"
          amount={formatCurrency(summary.totalPaid)}
          type="success"
        />
        <StatCard
          label="A favor"
          amount={formatCurrency(summary.totalCredit)}
          type="warning"
        />
      </View>

      {/* ── Lista de facturas ───────────────────────── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
            // Pull to refresh — desliza hacia abajo para recargar
          />
        }
      >
        <Text style={styles.sectionTitle}>Facturas recientes</Text>

        {/* Estado de carga inicial */}
        {loading && invoices.length === 0 && (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginTop: SPACING.xl }}
          />
        )}

        {/* Estado de error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sin facturas */}
        {!loading && !error && invoices.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No tienes facturas aún</Text>
          </View>
        )}

        {/* Facturas reales — máximo 3 en dashboard */}
        {invoices.slice(0, 3).map((invoice) => (
          <InvoiceItem
            key={invoice.id}
            invoice={invoice}
            expanded={false}
            onPress={() => router.push(`/(app)/invoice-detail?id=${invoice.id}` as Href)}
          />
        ))}

      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primarySurface },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  username: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
  },
  scroll: { flex: 1, marginTop: SPACING.md },
  scrollContent: { paddingBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  errorBox: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FDECEA',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.text.placeholder,
    fontSize: FONTS.sizes.md,
  },
});