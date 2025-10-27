// Botão grande com alto contraste e haptics
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { tap } from '@app/utils/haptics';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { tokens } from '@app/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export default function BigButton({ label, onPress, variant = 'primary', style, accessibilityLabel }: Props) {
  const { hapticsEnabled } = useSettingsStore();
  const handlePress = async () => {
    if (hapticsEnabled) await tap();
    onPress();
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      style={[styles.base, variant === 'secondary' ? styles.secondary : styles.primary, style]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.textOnPrimary : styles.textOnSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8
  },
  primary: { backgroundColor: tokens.colors.primary },
  secondary: { backgroundColor: tokens.colors.secondary },
  text: { fontWeight: '700', fontSize: 18 },
  textOnPrimary: { color: '#FFFFFF' },
  textOnSecondary: { color: '#000000' }
});
