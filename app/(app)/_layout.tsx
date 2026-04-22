// Layout del área protegida de la app.
// Solo usuarios autenticados llegan aquí.

import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerShown: false,
      }}
    />
  );
}