// Slider de volume acessível (usa apenas Stepper textual para simplicidade cross-plataforma)
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = { value: number; onChange: (v: number) => void; accessibilityLabel?: string };

export default function VolumeSlider({ value, onChange, accessibilityLabel }: Props) {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const step = 0.1;
  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel}>
      <Pressable style={styles.btn} onPress={() => onChange(clamp(value - step))}>
        <Text style={styles.btnText}>-</Text>
      </Pressable>
      <Text style={styles.value}>{Math.round(value * 100)}%</Text>
      <Pressable style={styles.btn} onPress={() => onChange(clamp(value + step))}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { backgroundColor: tokens.colors.secondary, borderRadius: 10, padding: 10 },
  btnText: { fontFamily: 'Lemondrop-Bold', color: '#FFFFFF' },
  value: { color: tokens.colors.text, fontSize: 16, width: 56, textAlign: 'center' }
});
