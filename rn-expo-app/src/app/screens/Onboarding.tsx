// Onboarding: pequenas preferências iniciais com RHF
import React from 'react';
import { View, StyleSheet, Text, Switch, Pressable, ScrollView, Linking } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore } from '@app/state/useSettingsStore';

type FormValues = { hapticsEnabled: boolean };

export default function Onboarding() {
  const { t } = useTranslation(['onboarding']);
  const { setPreferences } = useSettingsStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { hapticsEnabled: true }
  });

  const onSubmit = (data: FormValues) => {
    setPreferences(data);
    navigation.goBack();
  };

  const openEmergencyLine = (phone: string) => {
    void Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('welcome')}</Text>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              {t(
                'disclaimerSupportTool',
                'Este app é uma ferramenta de apoio emocional. Não substitui atendimento médico ou psicológico.'
              )}
            </Text>
            <Text style={styles.disclaimerHeading}>
              {t('disclaimerEmergencyTitle', 'Em situação de emergência:')}
            </Text>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('cvvAccessibility', 'Ligar para o CVV 188')}
              onPress={() => openEmergencyLine('188')}
              style={styles.emergencyLink}
            >
              <Text style={styles.emergencyLabel}>{t('cvvLabel', 'CVV')}</Text>
              <Text style={styles.emergencyNumber}>{t('cvvNumber', '188')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('samuAccessibility', 'Ligar para o SAMU 192')}
              onPress={() => openEmergencyLine('192')}
              style={styles.emergencyLink}
            >
              <Text style={styles.emergencyLabel}>{t('samuLabel', 'SAMU')}</Text>
              <Text style={styles.emergencyNumber}>{t('samuNumber', '192')}</Text>
            </Pressable>

            <Text style={styles.disclaimerText}>
              {t(
                'disclaimerImmediateRisk',
                'Se você ou alguém está em risco imediato, ligue agora.'
              )}
            </Text>
          </View>

          <Pressable accessibilityRole="link" onPress={() => navigation.navigate('Legal')}>
            <Text style={styles.link}>{t('legalLink', 'Ver Política de Privacidade e Termos')}</Text>
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.label}>{t('enableHaptics')}</Text>
            <Controller
              name="hapticsEnabled"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch value={value} onValueChange={onChange} />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <BigButton label={t('continue')} onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: tokens.spacing(3) },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.spacing(1.5) },
  disclaimerCard: {
    width: '100%',
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
    padding: tokens.spacing(2),
    gap: tokens.spacing(1.5),
  },
  disclaimerHeading: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h3,
    fontFamily: tokens.typography.weights.bold,
    textAlign: 'center',
  },
  disclaimerText: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.body,
    lineHeight: tokens.typography.sizes.body * tokens.typography.lineHeight.normal,
    textAlign: 'center',
  },
  emergencyLabel: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.label,
    fontFamily: tokens.typography.weights.bold,
  },
  emergencyLink: {
    width: '100%',
    backgroundColor: tokens.colors.accent,
    borderRadius: 16,
    paddingVertical: tokens.spacing(1.5),
    paddingHorizontal: tokens.spacing(2),
    alignItems: 'center',
    gap: tokens.spacing(0.5),
  },
  emergencyNumber: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h3,
    fontFamily: tokens.typography.weights.bold,
  },
  footer: { paddingBottom: 8 },
  label: { color: tokens.colors.text, fontSize: 16 },
  link: { color: tokens.colors.primary, textDecorationLine: 'underline', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  scrollContent: { flexGrow: 1, paddingBottom: tokens.spacing(2) },
  title: { color: tokens.colors.text, fontSize: 22, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
});
