// app/(auth)/_layout.tsx
// Layout del grupo de pantallas de autenticación.
// Cualquier pantalla dentro de (auth)/ hereda este layout.
// Por ahora es simple — sin header, sin tabs.

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}