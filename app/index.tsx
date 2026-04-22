// app/index.tsx
// Punto de entrada de la app.
// Su única responsabilidad: decidir a dónde ir.
// Si hay sesión → dashboard
// Si no hay sesión → login
// Mientras verifica → pantalla de carga

import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../src/constants/theme';
import { useAuth } from '../src/hooks/useAuth';


export default function Index() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo navegamos cuando ya tenemos una respuesta definitiva
    // 'idle' y 'loading' = todavía verificando, esperamos
    if (status === 'authenticated') {
      router.replace('/(app)/dashboard' as Href);
      // replace en lugar de push: no volver al index con el botón "atrás"
    } else if (status === 'unauthenticated' || status === 'error') {
      router.replace('/(auth)/login' as Href);
    }
  }, [status]);

  // Mientras verifica la sesión, mostramos spinner
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});