import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Banknote, CheckCircle, ChevronLeft, CreditCard } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppModal, ModalType } from '../../src/components/ui/AppModal';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useInvoices } from '../../src/hooks/useInvoices';
import { formatCurrency } from '../../src/services/odoo/invoiceService';
import { fetchPaymentMethods, PaymentMethod, registerPayment } from '../../src/services/odoo/paymentService';
import { OdooInvoice } from '../../src/types/odoo.types';

interface ModalState {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
}

export default function PayScreen() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { invoices, refresh } = useInvoices(user?.partnerId ?? null);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<OdooInvoice | null>(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    visible: false, type: 'info', title: '', message: '',
  });

  const pendingInvoices = invoices.filter(
    inv => inv.payment_state !== 'paid'
  );

  useEffect(() => {
    fetchPaymentMethods()
      .then(setMethods)
      .catch(() => showModal('error', 'Error', 'No se pudieron cargar los métodos de pago.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pendingInvoices.length > 0) {
      // Si viene de invoice-detail con un invoiceId específico
      if (invoiceId) {
        const found = pendingInvoices.find(inv => inv.id === Number(invoiceId));
        setSelectedInvoice(found ?? pendingInvoices[0]);
      } else {
        setSelectedInvoice(pendingInvoices[0]);
      }
    }
  }, [invoices, invoiceId]);

  useEffect(() => {
    // Pre-llenar el monto con el saldo pendiente de la factura
    if (selectedInvoice) {
      setAmount(selectedInvoice.amount_residual.toString());
    }
  }, [selectedInvoice]);

  const showModal = (type: ModalType, title: string, message: string) => {
    setModal({ visible: true, type, title, message });
  };

  const handlePay = async () => {
    if (!selectedInvoice) {
      showModal('warning', 'Sin factura', 'Selecciona una factura primero.');
      return;
    }
    if (!selectedMethod) {
      showModal('warning', 'Sin método', 'Selecciona un método de pago.');
      return;
    }

    const amountNum = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      showModal('warning', 'Monto inválido', 'Ingresa un monto válido mayor a 0.');
      return;
    }
    if (amountNum > selectedInvoice.amount_residual) {
      showModal(
        'warning',
        'Monto excedido',
        `El monto no puede superar el saldo pendiente de ${formatCurrency(selectedInvoice.amount_residual)}.`
      );
      return;
    }

    setPaying(true);
    try {
      await registerPayment({
        invoiceId: selectedInvoice.id,
        journalId: selectedMethod.id,
        amount: amountNum,
        memo: memo.trim() || undefined,
      });

      await refresh();
      setAmount('');
      setMemo('');

      showModal(
        'success',
        '¡Solicitud enviada!',
        'Tu solicitud de pago fue registrada. El administrador la revisará y confirmará pronto.'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar el pago';
      showModal('error', 'Error', message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar pago</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* Selección de factura */}
            {pendingInvoices.length === 0 ? (
              <View style={styles.emptyBox}>
                <CheckCircle size={40} color={COLORS.primary} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No tienes facturas pendientes</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>FACTURA</Text>
                <View style={styles.card}>
                  {pendingInvoices.map((inv, index) => (
                    <TouchableOpacity
                      key={inv.id}
                      style={[
                        styles.optionRow,
                        index < pendingInvoices.length - 1 && styles.optionBorder,
                        selectedInvoice?.id === inv.id && styles.optionActive,
                      ]}
                      onPress={() => setSelectedInvoice(inv)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[
                          styles.optionTitle,
                          selectedInvoice?.id === inv.id && styles.optionTitleActive,
                        ]}>
                          {inv.name}
                        </Text>
                        <Text style={[
                          styles.optionSub,
                          selectedInvoice?.id === inv.id && styles.optionSubActive,
                        ]}>
                          Saldo: {formatCurrency(inv.amount_residual)}
                        </Text>
                      </View>
                      {selectedInvoice?.id === inv.id && (
                        <CheckCircle size={18} color={COLORS.white} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Método de pago */}
                <Text style={styles.sectionLabel}>MÉTODO DE PAGO</Text>
                <View style={styles.card}>
                  {methods.map((method, index) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.optionRow,
                        index < methods.length - 1 && styles.optionBorder,
                        selectedMethod?.id === method.id && styles.optionActive,
                      ]}
                      onPress={() => setSelectedMethod(method)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.methodIconWrap}>
                        {method.type === 'bank' ? (
                          <CreditCard
                            size={16}
                            color={selectedMethod?.id === method.id
                              ? COLORS.white : COLORS.primary}
                            strokeWidth={2}
                          />
                        ) : (
                          <Banknote
                            size={16}
                            color={selectedMethod?.id === method.id
                              ? COLORS.white : COLORS.primary}
                            strokeWidth={2}
                          />
                        )}
                      </View>
                      <Text style={[
                        styles.optionTitle,
                        selectedMethod?.id === method.id && styles.optionTitleActive,
                      ]}>
                        {method.name}
                      </Text>
                      {selectedMethod?.id === method.id && (
                        <CheckCircle size={18} color={COLORS.white} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Monto */}
                <Text style={styles.sectionLabel}>MONTO</Text>
                <View style={styles.card}>
                  <Text style={styles.amountLabel}>
                    Saldo pendiente: {selectedInvoice
                      ? formatCurrency(selectedInvoice.amount_residual)
                      : '—'}
                  </Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.text.placeholder}
                  />
                </View>

                {/* Referencia opcional */}
                <Text style={styles.sectionLabel}>REFERENCIA (OPCIONAL)</Text>
                <View style={styles.card}>
                  <TextInput
                    style={styles.memoInput}
                    value={memo}
                    onChangeText={setMemo}
                    placeholder="Número de transferencia, cheque, etc."
                    placeholderTextColor={COLORS.text.placeholder}
                    multiline
                  />
                </View>
                {/* Datos bancarios — aparece al seleccionar transferencia */}
                {selectedMethod?.type === 'bank' && selectedMethod.bank_info && (
                <View style={styles.bankCard}>
                    <Text style={styles.bankTitle}>Datos para transferencia</Text>
                    <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Banco</Text>
                    <Text style={styles.bankValue}>{selectedMethod.bank_info.bank_name || 'No especificado'}</Text>
                    </View>
                    <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Titular</Text>
                    <Text style={styles.bankValue}>{selectedMethod.bank_info.account_holder}</Text>
                    </View>
                    <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Cuenta</Text>
                    <Text style={styles.bankValue}>{selectedMethod.bank_info.account_number}</Text>
                    </View>
                </View>
                )}

                {/* Botón pagar */}
                <TouchableOpacity
                  style={[styles.payBtn, paying && styles.payBtnDisabled]}
                  onPress={handlePay}
                  disabled={paying}
                  activeOpacity={0.85}
                >
                  {paying ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <CreditCard size={18} color={COLORS.white} strokeWidth={2.5} />
                      <Text style={styles.payBtnText}>Enviar solicitud de pago</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <AppModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => {
          setModal(prev => ({ ...prev, visible: false }));
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
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  optionBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  optionActive: {
    backgroundColor: COLORS.primary,
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  optionTitleActive: { color: COLORS.white },
  optionSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.placeholder,
    marginTop: 2,
  },
  optionSubActive: { color: 'rgba(255,255,255,0.8)' },
  methodIconWrap: {
    width: 32, height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    padding: SPACING.md,
    textAlign: 'center',
  },
  memoInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    ...SHADOWS.md,
  },
  payBtnDisabled: { opacity: 0.65 },
  payBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyText: {
    color: COLORS.text.placeholder,
    fontSize: FONTS.sizes.md,
  },

  // --- Estilos para datos bancarios ---
  bankCard: {
  backgroundColor: COLORS.primarySurface,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.md,
  borderWidth: 1,
  borderColor: COLORS.primaryLight,
  gap: SPACING.sm,
},
bankTitle: {
  fontSize: FONTS.sizes.sm,
  fontWeight: '700',
  color: COLORS.primary,
  marginBottom: SPACING.xs,
},
bankRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
bankLabel: {
  fontSize: FONTS.sizes.sm,
  color: COLORS.text.secondary,
},
bankValue: {
  fontSize: FONTS.sizes.sm,
  fontWeight: '600',
  color: COLORS.text.primary,
},
});