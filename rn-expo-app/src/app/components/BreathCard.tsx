// Card de Respiração guiada (Box Breathing) para uso dentro da sessão
import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { tokens } from '@app/theme/tokens';
import { useTranslation } from 'react-i18next';
import { useBoxBreath, type BoxBreathPhase } from '@app/hooks/useBoxBreath';

type Props = {
  onDone?: () => void;
  cycles?: number; // padrão 4
  minimal?: boolean;
  phaseLabels?: Partial<Record<'inspire' | 'expire' | 'hold', string>>;
};

export default function BreathCard({ onDone, cycles = 4, minimal = false, phaseLabels }: Props) {
  const { t } = useTranslation('cards');
  const scale = useRef(new Animated.Value(1)).current;
  const { cycle, isRunning, phase, start, stop } = useBoxBreath(cycles);
  const defaultPhaseLabels = {
    inspire: phaseLabels?.inspire ?? t('breath.phase.inspire', 'Inspirar'),
    expire: phaseLabels?.expire ?? t('breath.phase.expire', 'Expirar'),
    hold: phaseLabels?.hold ?? t('breath.phase.hold', 'Segurar'),
  };

  const animateTo = useCallback(
    (toValue: number, duration: number) =>
      new Promise<void>(resolve => {
        Animated.timing(scale, { toValue, duration, useNativeDriver: true }).start(() => resolve());
      }),
    [scale]
  );

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    if (phase === 'inspire') {
      animateTo(1.4, 4000);
      return;
    }

    if (phase === 'expire') {
      animateTo(0.6, 4000);
    }
  }, [animateTo, phase]);

  useEffect(() => {
    if (!isRunning && phase === 'done') {
      onDone?.();
    }
  }, [isRunning, onDone, phase]);

  const getPhaseLabel = (currentPhase: BoxBreathPhase) => {
    if (minimal) {
      return currentPhase === 'expire' || currentPhase === 'segura2'
        ? defaultPhaseLabels.expire
        : defaultPhaseLabels.inspire;
    }

    if (currentPhase === 'inspire') {
      return defaultPhaseLabels.inspire;
    }

    if (currentPhase === 'expire') {
      return defaultPhaseLabels.expire;
    }

    return defaultPhaseLabels.hold;
  };

  const currentPhaseLabel = getPhaseLabel(phase);

  return (
    <View style={[styles.container, minimal ? styles.minimalContainer : null]}>
      {!minimal ? <Text style={styles.title}>{t('breath.title')}</Text> : null}
      <Text style={[styles.subtitle, minimal ? styles.minimalSubtitle : null]}>
        {isRunning
          ? minimal
            ? currentPhaseLabel
            : t('breath.status', {
                current: cycle,
                total: cycles,
                phase: currentPhaseLabel,
                defaultValue: 'Ciclo {{current}} de {{total}} - {{phase}}',
              })
          : t('breath.completed', 'Concluído')}
      </Text>
      <View style={styles.ballContainer}>
        <Animated.View
          accessibilityRole="image"
          accessibilityLabel={t('breath.ballA11y', {
            phase: currentPhaseLabel,
            defaultValue: 'Bola de respiração, estado: {{phase}}',
          })}
          style={[styles.ball, { transform: [{ scale }] }]}
        />
      </View>
      {!minimal && !isRunning ? (
        <Text style={styles.hint}>
          {t('breath.nextHint', 'Deslize ou toque na tela para continuar')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: tokens.colors.primary,
  },
  ballContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    gap: tokens.spacing(1),
  },
  hint: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.body,
    textAlign: 'center',
  },
  minimalContainer: {
    gap: tokens.spacing(2),
  },
  minimalSubtitle: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h1,
    fontFamily: tokens.typography.weights.bold,
  },
  subtitle: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    textAlign: 'center',
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
});
