import { useEffect, useRef } from 'react';
import {
  Animated, Modal, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

export type ModalType = 'error' | 'success' | 'warning' | 'info';

interface AppModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

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

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel ?? onConfirm}
        />

        <Animated.View style={[
          styles.container,
          { transform: [{ scale: scaleAnim }] },
        ]}>

          {/* Ícono */}
          <View style={[styles.iconCircle, { backgroundColor: config.bgColor }]}>
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

            {cancelText && onCancel && (
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

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
    fontWeight: '700',
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: COLORS.white,
  },
});