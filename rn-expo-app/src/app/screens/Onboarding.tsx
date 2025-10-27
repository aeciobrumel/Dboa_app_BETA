// Onboarding: pequenas preferências iniciais com RHF
import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore } from '@app/state/useSettingsStore';

type FormValues = { hapticsEnabled: boolean };

export default function Onboarding() {
  const { t } = useTranslation(['onboarding']);
  const { setPreferences } = useSettingsStore();
  const navigation = useNavigation();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { hapticsEnabled: true }
  });

  const onSubmit = (data: FormValues) => {
    setPreferences(data);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('welcome')}</Text>
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
      <View style={styles.footer}>
        <BigButton label={t('continue')} onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: { color: tokens.colors.text, fontSize: 22, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
  label: { color: tokens.colors.text, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  footer: { paddingBottom: 8 }
});
