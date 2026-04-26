import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { ChevronRight, CreditCard, LogOut, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppModal } from '../../src/components/ui/AppModal';
import { BottomNav } from '../../src/components/ui/BottomNav';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';

const MENU_ITEMS = [
  {
    icon: User,
    label: 'Mis datos',
    route: '/(app)/my-data' as Href,
  },
  {
    icon: CreditCard,
    label: 'Historial de pagos',
    route: '/(app)/payment-history' as Href,
  },
];

export default function ProfileScreen() {
  const { user, logout, status } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const firstName = user?.name?.split(' ')[0] ?? 'Cliente';

  useEffect(() => {
  if (status === 'unauthenticated') {
    router.replace('/(auth)/login' as Href);
  }
}, [status]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header con avatar */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>ID: {user?.uid}</Text>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === MENU_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, isLast && styles.menuItemLast]}
                onPress={() => router.push(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <IconComponent
                    size={15}
                    color={COLORS.primary}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight
                  size={16}
                  color={COLORS.primaryLight}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.85}
        >
          <LogOut size={16} color="#E74C3C" strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNav />

      <AppModal
        visible={showLogoutModal}
        type="warning"
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar sesión? Tendrás que ingresar nuevamente."
        confirmText="Sí, salir"
        cancelText="Cancelar"
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primarySurface },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxl + SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '700',
  },
  name: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  email: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FONTS.sizes.xs,
    marginTop: 3,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.primarySurface,
    gap: SPACING.md,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FDECEA',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});