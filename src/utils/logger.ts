// src/utils/logger.ts
// Logger que solo muestra mensajes en desarrollo.
// En producción (APK final) los logs se silencian automáticamente.
// __DEV__ es una variable global de React Native/Expo.

export const logger = {
  log: (message: string, data?: unknown) => {
    if (__DEV__) console.log(`[LOG] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown) => {
    if (__DEV__) console.error(`[ERROR] ${message}`, error ?? '');
  },
  warn: (message: string, data?: unknown) => {
    if (__DEV__) console.warn(`[WARN] ${message}`, data ?? '');
  },
};