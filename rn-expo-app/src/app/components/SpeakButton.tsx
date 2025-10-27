// Botão para falar o conteúdo de um cartão (TTS)
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { tokens } from '@app/theme/tokens';
import { speak, stopSpeaking } from '@app/utils/speak';
import { tap } from '@app/utils/haptics';
import { useTranslation } from 'react-i18next';

type Props = { text: string; style?: ViewStyle };

export default function SpeakButton({ text, style }: Props) {
  const { t } = useTranslation('cards');
  const onPress = async () => {
    await tap();
    speak(text);
  };
  return (
    <Pressable
      onPress={onPress}
      onLongPress={stopSpeaking}
      accessibilityRole="button"
      accessibilityLabel={t('user.listen', 'Ouvir cartão')}
      style={[styles.btn, style]}
    >
      <Text style={styles.text}>{t('user.listen', 'Ouvir cartão')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: tokens.colors.secondary, borderRadius: 10, padding: 12, alignItems: 'center' },
  text: { color: '#000', fontWeight: '700' }
});

