// Botão para falar o conteúdo de um cartão (TTS)
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@app/theme/tokens';
import { speak, stopSpeaking } from '@app/utils/speak';
import { tap } from '@app/utils/haptics';
import { useTranslation } from 'react-i18next';

type Props = { text: string; style?: ViewStyle };

function VolumeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
      <Path
        d="M5 9.5V14.5H8.4L12.5 18V6L8.4 9.5H5Z"
        stroke={tokens.colors.primary}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M16 9C17.2 10 17.9 11.3 17.9 12.7C17.9 14.1 17.2 15.4 16 16.4"
        stroke={tokens.colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M18.7 6.8C20.6 8.4 21.7 10.5 21.7 12.7C21.7 14.9 20.6 17 18.7 18.6"
        stroke={tokens.colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function SpeakButton({ text, style }: Props) {
  const { t } = useTranslation('cards');
  const handlePress = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    await tap();
    speak(text);
  };

  const handleLongPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    stopSpeaking();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={t('user.listen', 'Ouvir cartão')}
      style={[styles.btn, style]}
    >
      <View style={styles.content}>
        <VolumeIcon />
        <Text style={styles.text}>{t('user.listen', 'Ouvir cartão')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: tokens.spacing(2),
    paddingVertical: tokens.spacing(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: tokens.colors.bg,
    borderWidth: 1.5,
    borderColor: tokens.colors.secondary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing(0.75),
  },
  text: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.body,
  },
});
