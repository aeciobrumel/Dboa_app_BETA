import React, { useMemo, useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { useContactsStore } from '@app/state/useContactsStore';
import { tokens } from '@app/theme/tokens';

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

function buildSmsUrl(phone: string, message: string) {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

export default function EmergencyButton() {
  const { t } = useTranslation('app');
  const [visible, setVisible] = useState(false);
  const primaryContact = useContactsStore(state => state.contacts[0]);

  const trustedContactLabel = useMemo(() => {
    if (!primaryContact) {
      return '';
    }

    return t('emergency.trustedContactWithName', {
      name: primaryContact.name,
      defaultValue: `${primaryContact.name} - pedir apoio`,
    });
  }, [primaryContact, t]);

  const openUrlSequence = async (urls: string[]) => {
    for (const url of urls) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return;
        }
      } catch {
        // Tenta a próxima opção disponível.
      }
    }
  };

  const callEmergencyLine = (phone: string) => {
    setVisible(false);
    void openUrlSequence([`tel:${phone}`]);
  };

  const contactTrustedPerson = () => {
    if (!primaryContact) {
      return;
    }

    const phone = normalizePhone(primaryContact.phone);
    const message = t(
      'emergency.trustedContactMessage',
      'Estou passando por um momento difícil e preciso de companhia.'
    );

    setVisible(false);

    const primaryUrl =
      primaryContact.app === 'whatsapp'
        ? `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`
        : buildSmsUrl(phone, message);

    void openUrlSequence([primaryUrl, `tel:${phone}`]);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('emergency.buttonLabel', 'Emergência')}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
      >
        <View style={styles.fabBase}>
          <Text style={styles.fabText}>SOS</Text>
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.title}>{t('emergency.title', 'Ajuda imediata')}</Text>
            <Text style={styles.description}>
              {t('emergency.description', 'Escolha uma opção de apoio agora.')}
            </Text>

            <BigButton
              label={t('emergency.cvv', 'CVV - 188')}
              accessibilityLabel={t('emergency.callCvv', 'Ligar para o CVV 188')}
              onPress={() => callEmergencyLine('188')}
            />
            <BigButton
              label={t('emergency.samu', 'SAMU - 192')}
              accessibilityLabel={t('emergency.callSamu', 'Ligar para o SAMU 192')}
              onPress={() => callEmergencyLine('192')}
            />

            {primaryContact ? (
              <BigButton
                variant="secondary"
                label={trustedContactLabel}
                accessibilityLabel={t('emergency.callTrustedContact', {
                  name: primaryContact.name,
                  defaultValue: `Falar com ${primaryContact.name}`,
                })}
                onPress={contactTrustedPerson}
              />
            ) : (
              <Text style={styles.noContact}>
                {t('emergency.noTrustedContact', 'Sem contato de confiança cadastrado.')}
              </Text>
            )}

            <BigButton
              variant="secondary"
              label={t('emergency.close', 'Fechar')}
              onPress={() => setVisible(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  description: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.body,
    lineHeight: tokens.typography.sizes.body * tokens.typography.lineHeight.normal,
    marginBottom: tokens.spacing(1),
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    top: tokens.spacing(3),
    right: tokens.spacing(2),
    zIndex: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#991B1B',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    shadowColor: '#991B1B',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  fabBase: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#B91C1C',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabPressed: {
    paddingTop: 4,
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabText: {
    color: '#FFF7F7',
    fontFamily: tokens.typography.weights.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(127, 29, 29, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing(3),
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
  },
  noContact: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    marginVertical: tokens.spacing(1),
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: tokens.spacing(3),
    backgroundColor: `${tokens.colors.primary}44`,
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    fontFamily: tokens.typography.weights.bold,
    textAlign: 'center',
    marginBottom: tokens.spacing(1),
  },
});
