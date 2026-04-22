import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { InvoiceItem } from '../../src/components/ui/InvoiceItem';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useInvoices } from '../../src/hooks/useInvoices';

type FilterType = 'all' | 'pending' | 'paid';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'paid', label: 'Pagadas' },
];

const router = useRouter();

export default function InvoicesScreen() {
  const { user } = useAuth();
  const { invoices, loading, error, refresh } = useInvoices(
    user?.partnerId ?? null
  );
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = invoices.filter((inv) => {
    if (filter === 'pending') return inv.payment_state !== 'paid';
    if (filter === 'paid') return inv.payment_state === 'paid';
    return true;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.title}>Mis facturas</Text>
        <Text style={styles.subtitle}>{invoices.length} en total</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, filter === f.key && styles.pillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.pillText,
              filter === f.key && styles.pillTextActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading && invoices.length === 0 && (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginTop: SPACING.xl }}
          />
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No hay facturas en esta categoría
            </Text>
          </View>
        )}

        {filtered.map((invoice) => (
  <InvoiceItem
    key={invoice.id}
    invoice={invoice}
    expanded
    onUpload={() => {
      router.push('/(app)/upload' as Href);
      // En la siguiente fase pasaremos el invoiceId como parámetro
    }}
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
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.primaryLight,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
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