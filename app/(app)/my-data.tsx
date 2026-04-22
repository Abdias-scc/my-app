import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Phone, User } from 'lucide-react-native';
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
import { useAuth } from '../../src/hooks/useAuth';
import { fetchPartner, PartnerData } from '../../src/services/odoo/partnerService';

export default function MyDataScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.partnerId) return;
    fetchPartner(user.partnerId)
      .then(setPartner)
      .catch(() => setError('No se pudieron cargar tus datos.'))
      .finally(() => setLoading(false));
  }, [user?.partnerId]);

  const firstName = partner?.name?.split(' ')[0] ?? '?';

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
        <Text style={styles.title}>Mis datos</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.avatarName}>{partner?.name}</Text>
          </View>

          {/* Datos */}
          <View style={styles.card}>
            <DataRow
              icon={<User size={16} color={COLORS.primary} strokeWidth={2} />}
              label="NOMBRE"
              value={partner?.name}
            />
            <DataRow
              icon={<Mail size={16} color={COLORS.primary} strokeWidth={2} />}
              label="CORREO"
              value={partner?.email}
              divider
            />
            <DataRow
              icon={<Phone size={16} color={COLORS.primary} strokeWidth={2} />}
              label="TELÉFONO"
              value={partner?.phone || 'No registrado'}
              divider
            />
          </View>
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

interface DataRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  divider?: boolean;
  isLast?: boolean;
}

function DataRow({ icon, label, value, isLast }: DataRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, !value && styles.rowEmpty]}>
          {value || '—'}
        </Text>
      </View>
    </View>
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
    padding: SPACING.lg,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  avatarName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  rowEmpty: {
    color: COLORS.text.placeholder,
    fontWeight: '400',
  },
});