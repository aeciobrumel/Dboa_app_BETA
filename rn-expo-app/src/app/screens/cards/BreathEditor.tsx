// Editor do card de Respiração guiada: permite ajustar quantidade de ciclos
import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { useNavigation } from '@react-navigation/native';

export default function BreathEditor() {
  const { t } = useTranslation(['cards']);
  const nav = useNavigation();
  const { breathCycles, setPreferences } = useSettingsStore();
  const [cycles, setCycles] = React.useState(String(breathCycles ?? 4));

  const onSave = () => {
    const parsed = Math.max(1, Math.min(10, Number(cycles) || 4));
    setPreferences({ breathCycles: parsed });
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('breath.title')}</Text>
      <Text style={styles.label}>Ciclos</Text>
      <TextInput
        value={cycles}
        onChangeText={setCycles}
        keyboardType="number-pad"
        accessibilityLabel="Quantidade de ciclos do exercício"
        style={styles.input}
      />
      <Text style={styles.hint}>Escolha entre 1 e 10 ciclos.</Text>
      <BigButton label="Salvar" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 16, gap: 12 },
  title: { color: tokens.colors.text, fontSize: 22, fontWeight: '700' },
  label: { color: tokens.colors.text, fontSize: 14 },
  input: {
    backgroundColor: '#F4F6FA',
    color: tokens.colors.text,
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 120
  },
  hint: { color: tokens.colors.textMuted }
});

