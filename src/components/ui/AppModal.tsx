// src/components/ui/AppModal.tsx
// Modal reutilizable para toda la app.
// Tipos: 'error' | 'success' | 'warning' | 'info'
// Se usa en cualquier pantalla, no solo en login.

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

// Tipos posibles del modal — cada uno tiene ícono y color propio
export type ModalType = 'error' | 'success' | 'warning' | 'info';

interface AppModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;   // Texto del botón principal (default: 'Entendido')
  cancelText?: string;    // Texto botón secundario (si lo hay)
  onConfirm: () => void;
  onCancel?: () => void;  // Si no se pasa, no muestra botón cancelar
}

// Configuración visual por tipo de modal
const MODAL_CONFIG: Record<ModalType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  error: {
    icon: '✕',
    color: '#E74C3C',
    bgColor: '#FDECEA',
  },
  success: {
    icon: '✓',
    color: COLORS.primary,
    bgColor: COLORS.primarySurface,
  },
  warning: {
    icon: '!',
    color: '#F39C12',
    bgColor: '#FEF9EC',
  },
  info: {
    icon: 'i',
    color: '#2980B9',
    bgColor: '#EBF5FB',
  },
};

export function AppModal({
  visible,
  type,
  title,
  message,
  confirmText = 'Entendido',
  cancelText,
  onConfirm,
  onCancel,
}: AppModalProps) {

  // Animación de escala — el modal "aparece" con un efecto suave
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Cuando se abre: animar hacia tamaño normal
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset para la próxima vez que se abra
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const config = MODAL_CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // animationType="none" porque manejamos la animación manualmente
      // con Animated para más control
      statusBarTranslucent
      // statusBarTranslucent: el modal cubre también la barra de estado
    >
      {/* Fondo oscuro semitransparente */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel ?? onConfirm}
          // Tocar fuera del modal lo cierra
        />

        {/* Contenido del modal */}
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Ícono circular */}
          <View style={[
            styles.iconCircle,
            { backgroundColor: config.bgColor },
          ]}>
            <Text style={[styles.iconText, { color: config.color }]}>
              {config.icon}
            </Text>
          </View>

          {/* Textos */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Botones */}
          <View style={[
            styles.btnRow,
            cancelText ? styles.btnRowDouble : styles.btnRowSingle,
          ]}>

            {/* Botón cancelar (opcional) */}
            {cancelText && onCancel && (
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Botón confirmar */}
            <TouchableOpacity
              style={[
                styles.btnConfirm,
                { backgroundColor: config.color },
                cancelText ? styles.btnConfirmHalf : styles.btnConfirmFull,
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 80, 65, 0.5)',
    // Color del overlay con tono verde oscuro de tu paleta
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: 28,
    fontWeight: FONTS.weights.bold,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  btnRow: {
    width: '100%',
    gap: SPACING.sm,
  },
  btnRowSingle: {
    flexDirection: 'column',
  },
  btnRowDouble: {
    flexDirection: 'row',
  },
  btnCancel: {
    flex: 1,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.secondary,
  },
  btnConfirm: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmFull: {
    width: '100%',
  },
  btnConfirmHalf: {
    flex: 1,
  },
  btnConfirmText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
});