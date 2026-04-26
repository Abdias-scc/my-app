// Barra de navegación inferior compartida por todas las pantallas.
// Componente reutilizable — se usa en dashboard, facturas, subir y perfil.
// Recibe la ruta activa como prop para resaltar el ítem correcto.

import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import {
    FileText,
    LayoutGrid,
    Upload,
    User,
} from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

// Definición de cada ítem del menú
const NAV_ITEMS = [
  {
    label: 'Inicio',
    icon: LayoutGrid,
    route: '/(app)/dashboard',
  },
  {
    label: 'Facturas',
    icon: FileText,
    route: '/(app)/invoices',
  },
  {
    label: 'Subir',
    icon: Upload,
    route: '/(app)/upload',
  },
  {
    label: 'Perfil',
    icon: User,
    route: '/(app)/profile',
  },
] as const;

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  // usePathname devuelve la ruta actual: '/dashboard', '/invoices', etc.

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(item.label === 'Inicio'
          ? 'dashboard'
          : item.route.split('/').pop() ?? '');

        const IconComponent = item.icon;
        const color = isActive ? COLORS.primary : COLORS.primaryLight;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => router.push(item.route as Href)}
            activeOpacity={0.7}
          >
            <IconComponent
              size={20}
              color={color}
              strokeWidth={isActive ? 2.5 : 1.8}
              // strokeWidth más grueso en el ítem activo — sutil pero efectivo
            />
            <Text style={[
              styles.label,
              isActive && styles.labelActive,
            ]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: COLORS.primaryLight,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});