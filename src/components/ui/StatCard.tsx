// StatCard.tsx
// Tarjeta de resumen financiero del dashboard.
// Reutilizable — recibe label, amount y tipo de color.

import { StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

type StatCardType = 'danger' | 'success' | 'warning';

interface StatCardProps {
  label: string;
  amount: string;
  type: StatCardType;
}

const TYPE_COLORS: Record<StatCardType, string> = {
  danger: '#E74C3C',
  success: COLORS.primary,
  warning: '#F39C12',
};

export function StatCard({ label, amount, type }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: TYPE_COLORS[type] }]}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.md,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  amount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
});