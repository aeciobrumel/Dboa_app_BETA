// Settings: formulário com React Hook Form para preferências
import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import VolumeSlider from '@app/components/VolumeSlider';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore } from '@app/state/useSettingsStore';

type FormValues = {
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  bgVolume: number;
  narrationVolume: number;
};

export default function Settings() {
  const { t, i18n } = useTranslation(['settings', 'app']);
  const settings = useSettingsStore();
  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      hapticsEnabled: settings.hapticsEnabled,
      telemetryOptIn: settings.telemetryOptIn,
      bgVolume: settings.bgVolume,
      narrationVolume: settings.narrationVolume
    }
  });

  React.useEffect(() => {
    const sub = watch(values => {
      // Atualiza store e persiste
      settings.setPreferences(values);
    });
    return () => sub.unsubscribe();
  }, [watch, settings]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings:title')}</Text>

      <Text style={styles.label}>{t('settings:language')}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Text
          onPress={() => i18n.changeLanguage('pt-BR')}
          accessibilityRole="button"
          style={[styles.lang, i18n.language === 'pt-BR' && styles.langActive]}
        >
          PT-BR
        </Text>
        <Text
          onPress={() => i18n.changeLanguage('es')}
          accessibilityRole="button"
          style={[styles.lang, i18n.language === 'es' && styles.langActive]}
        >
          ES
        </Text>
      </View>

      <Text style={styles.label}>{t('settings:bgMusic')}</Text>
      <Controller
        name="bgVolume"
        control={control}
        render={({ field: { value, onChange } }) => (
          <VolumeSlider value={value} onChange={onChange} accessibilityLabel={t('settings:bgMusic')} />
        )}
      />

      <Text style={styles.label}>{t('settings:narration')}</Text>
      <Controller
        name="narrationVolume"
        control={control}
        render={({ field: { value, onChange } }) => (
          <VolumeSlider
            value={value}
            onChange={onChange}
            accessibilityLabel={t('settings:narration')}
          />
        )}
      />

      <View style={styles.row}>
        <Text style={styles.label}>{t('settings:haptics')}</Text>
        <Controller
          name="hapticsEnabled"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('settings:telemetry')}</Text>
        <Controller
          name="telemetryOptIn"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24, gap: 12 },
  title: { color: tokens.colors.text, fontSize: 22, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
  label: { color: tokens.colors.text, fontSize: 16, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lang: { color: tokens.colors.textMuted, fontSize: 16, padding: 8 },
  langActive: { color: tokens.colors.primary, fontWeight: '700', textDecorationLine: 'underline' }
});
