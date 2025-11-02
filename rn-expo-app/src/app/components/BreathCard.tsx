// Card de Respiração guiada (Box Breathing) para uso dentro da sessão
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated, AccessibilityInfo } from 'react-native';
import { tokens } from '@app/theme/tokens';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

type Props = {
  onDone?: () => void;
  cycles?: number; // padrão 4
};

export default function BreathCard({ onDone, cycles = 4 }: Props) {
  const { t } = useTranslation('cards');
  const scale = useRef(new Animated.Value(1)).current;
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState<'inspire' | 'segura' | 'expire' | 'segura2' | 'done'>('inspire');
  const [running, setRunning] = useState(true);

  const animateTo = useCallback((toValue: number, duration: number) =>
    new Promise<void>((resolve) => {
      Animated.timing(scale, { toValue, duration, useNativeDriver: true }).start(() => resolve());
    }), [scale]);

  const boxBreath = useCallback(async () => {
    try {
      for (let i = 1; i <= cycles; i++) {
        setCycle(i);
        // Inspirar 4s (bola cresce)
        setStep('inspire');
        AccessibilityInfo.announceForAccessibility(`Ciclo ${i}. Inspirar`);
        Haptics.selectionAsync();
        await animateTo(1.4, 4000);

        // Segurar 4s
        setStep('segura');
        AccessibilityInfo.announceForAccessibility('Segurar');
        Haptics.selectionAsync();
        await new Promise((r) => setTimeout(r, 4000));

        // Expirar 4s (bola diminui)
        setStep('expire');
        AccessibilityInfo.announceForAccessibility('Expirar');
        Haptics.selectionAsync();
        await animateTo(0.6, 4000);

        // Segurar 4s
        setStep('segura2');
        AccessibilityInfo.announceForAccessibility('Segurar');
        Haptics.selectionAsync();
        await new Promise((r) => setTimeout(r, 4000));
      }
      setStep('done');
      setRunning(false);
      AccessibilityInfo.announceForAccessibility('Exercício concluído');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDone?.();
    } catch {
      setStep('done');
      setRunning(false);
      onDone?.();
    }
  }, [animateTo, cycles, onDone]);

  useEffect(() => {
    let mounted = true;
    if (mounted) boxBreath();
    return () => { mounted = false; };
  }, [boxBreath]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('breath.title')}</Text>
      <Text style={styles.subtitle}>
        {running ? `Ciclo ${cycle} de ${cycles} — ${step === 'inspire' ? 'Inspirar' : step === 'expire' ? 'Expirar' : 'Segurar'}` : 'Concluído'}
      </Text>
      <View style={styles.ballContainer}>
        <Animated.View
          accessibilityRole="image"
          accessibilityLabel={`Bola de respiração, estado: ${step}`}
          style={[styles.ball, { transform: [{ scale }] }]}
        />
      </View>
      {!running && <Text style={styles.hint}>Toque em Próximo para continuar</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  title: { color: tokens.colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: tokens.colors.textMuted, fontSize: 14, textAlign: 'center' },
  ballContainer: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  ball: { width: 110, height: 110, borderRadius: 110, backgroundColor: '#36507D' },
  hint: { color: tokens.colors.textMuted }
});

