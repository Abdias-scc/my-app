import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Camera, FileText, ImageIcon, Upload, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppModal, ModalType } from '../../src/components/ui/AppModal';
import { BottomNav } from '../../src/components/ui/BottomNav';
import {
  BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING,
} from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useInvoices } from '../../src/hooks/useInvoices';
import { uploadVoucher } from '../../src/services/odoo/attachmentService';
import { OdooInvoice } from '../../src/types/odoo.types';

interface ModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
}

const MODAL_HIDDEN: ModalState = {
  visible: false, type: 'info', title: '', message: '',
};

const readImageAsBase64 = async (uri: string): Promise<string> => {
  const fileName = uri.split('/').pop() ?? 'image.jpg';
  const destUri = FileSystem.cacheDirectory + fileName;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  const base64 = await FileSystem.readAsStringAsync(destUri, {
    encoding: 'base64',
  });
  return base64;
};

export default function UploadScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { invoices, refresh } = useInvoices(user?.partnerId ?? null);

  const pendingInvoices = invoices.filter(
  inv => inv.payment_state !== 'paid'
    && inv.mobile_voucher_state !== 'pending_review'
    // ← facturas con comprobante en revisión no aparecen aquí
);

  const [selectedInvoice, setSelectedInvoice] = useState<OdooInvoice | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState<ModalState>(MODAL_HIDDEN);

  // Seleccionar primera factura pendiente cuando carguen
  useEffect(() => {
    if (pendingInvoices.length > 0 && !selectedInvoice) {
      setSelectedInvoice(pendingInvoices[0]);
    }
  }, [pendingInvoices]);

  const showModal = (type: ModalType, title: string, message: string) => {
    setModal({ visible: true, type, title, message });
  };

  const hideModal = () => setModal(MODAL_HIDDEN);

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showModal('warning', 'Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = await readImageAsBase64(uri);
      setImageUri(uri);
      setImageBase64(base64);
      setMimeType(result.assets[0].mimeType ?? 'image/jpeg');
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showModal('warning', 'Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = await readImageAsBase64(uri);
      setImageUri(uri);
      setImageBase64(base64);
      setMimeType(result.assets[0].mimeType ?? 'image/jpeg');
    }
  };

  const handleUpload = async () => {
    if (!selectedInvoice) {
      showModal('warning', 'Sin factura', 'Selecciona una factura primero.');
      return;
    }
    if (!imageBase64) {
      showModal('warning', 'Sin imagen', 'Selecciona o toma una foto del comprobante.');
      return;
    }
    if (!user?.partnerId) {
      showModal('error', 'Error de sesión', 'Reinicia sesión e intenta de nuevo.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `comprobante_${selectedInvoice.name.replace(/\//g, '_')}.jpg`;
      await uploadVoucher({
        invoiceId: selectedInvoice.id,
        invoiceName: selectedInvoice.name,
        partnerId: user.partnerId,
        imageBase64,
        fileName,
        mimeType,
      });

      await refresh();

      setImageUri(null);
      setImageBase64(null);

      showModal(
        'success',
        '¡Comprobante enviado!',
        `Tu comprobante para ${selectedInvoice.name} fue enviado correctamente. El equipo lo revisará pronto.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el comprobante';
      showModal('error', 'Error al enviar', message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.title}>Subir comprobante</Text>
        <Text style={styles.subtitle}>Adjunta tu pago a una factura</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pendingInvoices.length === 0 ? (
          <View style={styles.noInvoicesBox}>
            <FileText size={32} color={COLORS.primaryLight} strokeWidth={1.5} />
            <Text style={styles.noInvoicesText}>
              No tienes facturas pendientes
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>FACTURA</Text>
            <View style={styles.invoiceList}>
              {pendingInvoices.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={[
                    styles.invoiceOption,
                    selectedInvoice?.id === inv.id && styles.invoiceOptionActive,
                  ]}
                  onPress={() => setSelectedInvoice(inv)}
                  activeOpacity={0.8}
                >
                  <View style={styles.invoiceOptionLeft}>
                    <FileText
                      size={14}
                      color={selectedInvoice?.id === inv.id ? COLORS.white : COLORS.primary}
                      strokeWidth={2}
                    />
                    <Text style={[
                      styles.invoiceOptionName,
                      selectedInvoice?.id === inv.id && styles.invoiceOptionNameActive,
                    ]}>
                      {inv.name}
                    </Text>
                  </View>
                  <Text style={[
                    styles.invoiceOptionAmount,
                    selectedInvoice?.id === inv.id && styles.invoiceOptionNameActive,
                  ]}>
                    ${inv.amount_residual.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
              COMPROBANTE
            </Text>

            {!imageUri ? (
              <View style={styles.uploadZone}>
                <Upload size={36} color={COLORS.primaryLight} strokeWidth={1.5} />
                <Text style={styles.uploadTitle}>Selecciona tu comprobante</Text>
                <Text style={styles.uploadSub}>
                  Foto del recibo, transferencia o depósito
                </Text>
              </View>
            ) : (
              <View style={styles.previewCard}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => { setImageUri(null); setImageBase64(null); }}
                >
                  <X size={14} color={COLORS.white} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnCamera}
                onPress={handleCamera}
                activeOpacity={0.85}
              >
                <Camera size={16} color={COLORS.white} strokeWidth={2} />
                <Text style={styles.btnTextWhite}>Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnGallery}
                onPress={handleGallery}
                activeOpacity={0.85}
              >
                <ImageIcon size={16} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.btnTextGreen}>
                  {imageUri ? 'Cambiar' : 'Galería'}
                </Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <TouchableOpacity
                style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={uploading}
                activeOpacity={0.85}
              >
                {uploading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Upload size={16} color={COLORS.white} strokeWidth={2.5} />
                    <Text style={styles.submitText}>Enviar comprobante</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <BottomNav />

      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => {
          hideModal();
          if (modal.type === 'success') {
            router.replace('/(app)/invoices' as Href);
          }
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primarySurface },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  invoiceList: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  invoiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  invoiceOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  invoiceOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  invoiceOptionName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  invoiceOptionNameActive: {
    color: COLORS.white,
  },
  invoiceOptionAmount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: '#E74C3C',
  },
  uploadZone: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryLight,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  uploadTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  uploadSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.md,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
  },
  removeBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  btnCamera: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  btnGallery: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  btnTextWhite: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  btnTextGreen: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
    ...SHADOWS.md,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  noInvoicesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.md,
  },
  noInvoicesText: {
    color: COLORS.text.placeholder,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
});