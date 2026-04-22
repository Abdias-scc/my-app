import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppModal, ModalType } from '../../src/components/ui/AppModal';
import {
  BORDER_RADIUS,
  COLORS,
  FONTS,
  SHADOWS,
  SPACING,
} from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Estado del modal
interface ModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
}

const MODAL_HIDDEN: ModalState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modal, setModal] = useState<ModalState>(MODAL_HIDDEN);

  const { login, status, error, user } = useAuth();
  const router = useRouter();
  const isLoading = status === 'loading';

  // Helper para mostrar modal fácilmente desde cualquier parte
  const showModal = (
    type: ModalType,
    title: string,
    message: string,
  ) => {
    setModal({ visible: true, type, title, message });
  };

  const hideModal = () => setModal(MODAL_HIDDEN);

  // Navegar al dashboard cuando autenticación es exitosa
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace('/(app)/dashboard' as Href);
    }
  }, [status, user]);

  // Mostrar modal de error cuando falla el login en Odoo
  useEffect(() => {
    if (status === 'error' && error) {
      showModal(
        'error',
        'Acceso denegado',
        error,
      );
    }
  }, [status, error]);

  // ── Validaciones ────────────────────────────────────────
  const validate = (): boolean => {

    // Validación 1: campos vacíos
    if (!username.trim() && !password.trim()) {
      showModal(
        'warning',
        'Campos requeridos',
        'Por favor ingresa tu usuario y contraseña para continuar.',
      );
      return false;
    }

    // Validación 2: solo usuario vacío
    if (!username.trim()) {
      showModal(
        'warning',
        'Usuario requerido',
        'Ingresa tu correo o nombre de usuario de Odoo.',
      );
      return false;
    }

    // Validación 3: solo contraseña vacía
    if (!password.trim()) {
      showModal(
        'warning',
        'Contraseña requerida',
        'Por favor ingresa tu contraseña para continuar.',
      );
      return false;
    }

    // Validación 4: formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.includes('@') && !emailRegex.test(username.trim())) {
      showModal(
        'error',
        'Correo inválido',
        'El formato del correo no es válido. Ejemplo: usuario@empresa.com',
      );
      return false;
    }

    // Validación 5: contraseña muy corta
    if (password.length < 4) {
      showModal(
        'warning',
        'Contraseña muy corta',
        'La contraseña debe tener al menos 4 caracteres.',
      );
      return false;
    }

    return true;
  };

  const handleLogin = () => {
    if (!validate()) return;
    // Si validate() devuelve false, ya mostró el modal
    // No continuamos con el login
    login({ username: username.trim(), password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Bloque superior verde ──────────────────────── */}
      <View style={styles.topBlock}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner} />
        </View>
        <Text style={styles.appName}>Mi Portal</Text>
        <Text style={styles.appSub}>Gestión de cuentas</Text>
      </View>

      {/* ── Card de login ──────────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesión</Text>

        <Text style={styles.label}>USUARIO</Text>
        <View style={[
          styles.inputWrapper,
          username ? styles.inputActive : null,
        ]}>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={COLORS.text.placeholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        <Text style={styles.label}>CONTRASEÑA</Text>
        <View style={[
          styles.inputWrapper,
          password ? styles.inputActive : null,
        ]}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.text.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeText}>
              {passwordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.btnText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotBtn}
          activeOpacity={0.7}
          onPress={() => showModal(
            'info',
            'Recuperar contraseña',
            'Contacta al administrador del sistema para restablecer tu contraseña.',
          )}
        >
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer ─────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Odoo</Text>
      </View>

      {/* ── Modal de validaciones ──────────────────────── */}
      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={hideModal}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primarySurface,
  },
  topBlock: {
    height: SCREEN_HEIGHT * 0.38,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.xl,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoInner: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
  },
  appName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  appSub: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.secondary,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primarySurface,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    height: '100%',
  },
  eyeBtn: {
    paddingLeft: SPACING.sm,
  },
  eyeText: {
    fontSize: 16,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.3,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  forgotText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primaryMid,
    fontWeight: FONTS.weights.medium,
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
    letterSpacing: 0.5,
  },
});