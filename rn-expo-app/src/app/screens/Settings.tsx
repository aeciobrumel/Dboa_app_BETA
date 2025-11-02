// Settings: formulário com React Hook Form para preferências
import React from 'react';
import { View, StyleSheet, Text, Switch, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import VolumeSlider from '@app/components/VolumeSlider';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { useCardsStore } from '@app/state/useCardsStore';
import BigButton from '@app/components/BigButton';
import { speak, preferredVoiceAvailable } from '@app/utils/speak';
import * as DocumentPicker from 'expo-document-picker';

type FormValues = {
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  bgVolume: number;
  narrationVolume: number;
  autoReadCards: boolean;
  ttsVoice: 'auto' | 'male' | 'female';
  ttsRate: number;
  ttsPitch: number;
};

export default function Settings() {
  const { t, i18n } = useTranslation(['settings', 'app']);
  const settings = useSettingsStore();
  const cardsStore = useCardsStore();
  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      hapticsEnabled: settings.hapticsEnabled,
      telemetryOptIn: settings.telemetryOptIn,
      bgVolume: settings.bgVolume,
      narrationVolume: settings.narrationVolume,
      autoReadCards: settings.autoReadCards,
      ttsVoice: settings.ttsVoice,
      ttsRate: settings.ttsRate,
      ttsPitch: settings.ttsPitch
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('settings:title')}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t('settings:language')}</Text>
          <View style={styles.rowStart}>
            <Text onPress={() => i18n.changeLanguage('pt-BR')} accessibilityRole="button" style={[styles.lang, i18n.language === 'pt-BR' && styles.langActive]}>PT-BR</Text>
            <Text onPress={() => i18n.changeLanguage('es')} accessibilityRole="button" style={[styles.lang, i18n.language === 'es' && styles.langActive]}>ES</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('settings:bgMusic')}</Text>
          <Controller name="bgVolume" control={control} render={({ field: { value, onChange } }) => (
            <VolumeSlider value={value} onChange={onChange} accessibilityLabel={t('settings:bgMusic')} />
          )} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('settings:narration')}</Text>
          <Controller name="narrationVolume" control={control} render={({ field: { value, onChange } }) => (
            <VolumeSlider value={value} onChange={onChange} accessibilityLabel={t('settings:narration')} />
          )} />
          <View style={styles.rowStart}>
            <Text style={styles.label}>{t('settings:bgMusic')}: </Text>
            <Text style={{ color: settings.bgMusicUri ? tokens.colors.text : tokens.colors.textMuted }} numberOfLines={1}>
              {settings.bgMusicUri ? t('settings:customMusic', 'Música personalizada selecionada') : t('settings:defaultMusic', 'Usando música padrão')}
            </Text>
          </View>
          <View style={styles.rowStart}>
            <BigButton
              variant="secondary"
              label={t('settings:chooseMusic', 'Escolher música de fundo')}
              onPress={async () => {
                try {
                  const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
                  if (res.canceled) return;
                  const uri = res.assets?.[0]?.uri;
                  if (uri) settings.setPreferences({ bgMusicUri: uri, bgEnabled: true });
                } catch {}
              }}
            />
            <BigButton
              variant="secondary"
              label={t('settings:resetMusic', 'Usar música padrão')}
              onPress={() => settings.setPreferences({ bgMusicUri: undefined })}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsection}>{t('settings:voiceTitle', 'Voz da narração')}</Text>
          <Controller name="ttsVoice" control={control} render={({ field: { value, onChange } }) => (
            <View style={styles.rowStart}>
              <Text onPress={() => onChange('auto')} style={[styles.chip, value === 'auto' && styles.chipActive]} accessibilityRole="button">{t('settings:voiceAuto', 'Auto')}</Text>
              <Text onPress={() => onChange('female')} style={[styles.chip, value === 'female' && styles.chipActive]} accessibilityRole="button">{t('settings:voiceFemale', 'Feminina')}</Text>
              <Text onPress={() => onChange('male')} style={[styles.chip, value === 'male' && styles.chipActive]} accessibilityRole="button">{t('settings:voiceMale', 'Masculina')}</Text>
            </View>
          )} />

          <Text style={styles.label}>{t('settings:rate', 'Velocidade')}</Text>
          <Controller name="ttsRate" control={control} render={({ field: { value, onChange } }) => (
            <VolumeSlider value={value} onChange={onChange} accessibilityLabel={t('settings:rate', 'Velocidade')} />
          )} />

          <Text style={styles.label}>{t('settings:pitch', 'Tom')}</Text>
          <Controller name="ttsPitch" control={control} render={({ field: { value, onChange } }) => (
            <VolumeSlider value={value} onChange={onChange} accessibilityLabel={t('settings:pitch', 'Tom')} />
          )} />

          <BigButton
            variant="secondary"
            label={t('settings:voicePreview', 'Pré‑visualizar voz')}
            onPress={async () => {
              const ok = await preferredVoiceAvailable();
              await speak(t('settings:voicePreviewText', 'Olá, esta é a voz que vai te guiar.'));
              if (!ok) {
                setTimeout(() => speak(t('settings:voiceWarnNotAvailable', 'Aviso: a voz escolhida pode não estar disponível neste dispositivo. Usaremos a alternativa disponível.')), 600);
              }
            }}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.rowJustify}>
            <Text style={styles.label}>{t('settings:haptics')}</Text>
            <Controller name="hapticsEnabled" control={control} render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )} />
          </View>
          <View style={styles.rowJustify}>
            <Text style={styles.label}>{t('settings:telemetry')}</Text>
            <Controller name="telemetryOptIn" control={control} render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )} />
          </View>
          <View style={styles.rowJustify}>
            <Text style={styles.label}>{t('settings:autoReadCards', 'Leitura automática dos cartões')}</Text>
            <Controller name="autoReadCards" control={control} render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('settings:cardsSection', 'Cartões')}</Text>
          <BigButton
            variant="secondary"
            label={t('settings:restoreCards', 'Restaurar cartões padrão')}
            onPress={() => {
              Alert.alert(
                t('settings:restoreConfirmTitle', 'Restaurar cartões?'),
                t('settings:restoreConfirmBody', 'Isso substituirá seus cartões atuais pelos padrões.'),
                [
                  { text: t('app:common.cancel', 'Cancelar'), style: 'cancel' },
                  {
                    text: t('settings:restoreConfirmOk', 'Restaurar'),
                    style: 'destructive',
                    onPress: async () => {
                      await cardsStore.restoreDefaults();
                      Alert.alert(t('settings:restoreDoneTitle', 'Feito'), t('settings:restoreDoneBody', 'Cartões padrão restaurados.'));
                    }
                  }
                ]
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
  scroll: { padding: 24, gap: 20, alignItems: 'stretch' },
  section: { width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tokens.colors.secondary },
  panel: {},
  rowStart: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowJustify: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 560 },
  title: { color: tokens.colors.text, fontSize: 22, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
  label: { color: tokens.colors.text, fontSize: 16, marginTop: 8, textAlign: 'left' },
  subsection: { color: tokens.colors.text, fontSize: 16, marginTop: 12, fontWeight: '700', textAlign: 'left' },
  lang: { color: tokens.colors.textMuted, fontSize: 16, padding: 8 },
  langActive: { color: tokens.colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  chip: { color: tokens.colors.textMuted, borderWidth: 1, borderColor: tokens.colors.secondary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12 },
  chipActive: { backgroundColor: tokens.colors.secondary, color: '#000' }
});
