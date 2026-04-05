// Cartão: Respiração guiada. Bloqueia botão voltar e gestos, reproduz narração + trilha
import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, BackHandler, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SessionStackParamList } from '@app/navigation/SessionNavigator';
import AudioPlayer from '@app/components/AudioPlayer';
import { background, narration_breath_es, narration_breath_pt } from '@app/assets/audio/sources';
import { tokens } from '@app/theme/tokens';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { useBoxBreath } from '@app/hooks/useBoxBreath';
import EmergencyButton from '@app/components/EmergencyButton';
import BigButton from '@app/components/BigButton';

export default function Breath() {
  const navigation = useNavigation<NativeStackNavigationProp<SessionStackParamList>>();
  const { t, i18n } = useTranslation(['cards', 'app']);
  const breathCycles = useSettingsStore(s => s.breathCycles);
  const scale = useRef(new Animated.Value(1)).current;
  const { cycle, isRunning, phase, start, stop } = useBoxBreath(breathCycles);
  const phaseLabel =
    phase === 'inspire'
      ? t('cards:breath.phase.inspire', 'Inspirar')
      : phase === 'expire'
        ? t('cards:breath.phase.expire', 'Expirar')
        : t('cards:breath.phase.hold', 'Segurar');

  // Bloquear botão físico de voltar durante a sessão
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const animateTo = useCallback(
    (toValue: number, duration: number) =>
      new Promise<void>(resolve => {
        Animated.timing(scale, {
          toValue,
          duration,
          useNativeDriver: true
        }).start(() => resolve());
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

  return (
    <View style={styles.container}>
      <AudioPlayer
        backgroundSource={background}
        narrationSource={i18n.language === 'es' ? narration_breath_es : narration_breath_pt}
        loopBackground
        autoPlay
      />
      <EmergencyButton />
      <View style={styles.content}>
        <Text style={styles.title}>{t('cards:breath.title')}</Text>
        <Text style={styles.subtitle}>
          {isRunning
            ? t('cards:breath.status', {
                current: cycle,
                total: breathCycles,
                phase: phaseLabel,
                defaultValue: 'Ciclo {{current}} de {{total}} - {{phase}}',
              })
            : t('cards:breath.completed', 'Concluído')}
        </Text>
        <View style={styles.ballContainer}>
          <Animated.View
            accessibilityRole="image"
            accessibilityLabel={t('cards:breath.ballA11y', {
              phase: phaseLabel,
              defaultValue: 'Bola de respiração, estado: {{phase}}',
            })}
            style={[
              styles.ball,
              {
                transform: [{ scale }]
              }
            ]}
          />
        </View>
        <View style={styles.controls}>
          {!isRunning && (
            <BigButton
              variant="accent"
              accessibilityLabel={t(
                'app:session.breath.nextA11y',
                'Continuar para o próximo exercício'
              )}
              label={t('app:common.next')}
              onPress={() => {
                // Após respirar, ir para os cartões personalizados
                navigation.navigate('UserCardsSession');
              }}
            />
          )}
          {isRunning && (
            <Text style={styles.hint}>
              {t('cards:breath.waiting', {
                cycles: breathCycles,
                defaultValue: 'Aguarde enquanto orientamos sua respiração ({{cycles}} ciclos)',
              })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing(3),
    position: 'relative'
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: tokens.spacing(1) },
  title: { color: tokens.colors.text, fontSize: 24, textAlign: 'center', fontFamily: 'Lemondrop-Bold' },
  subtitle: { color: tokens.colors.textMuted, fontSize: 16, textAlign: 'center' },
  ballContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ball: {
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: tokens.colors.primary
  },
  controls: {
    marginTop: tokens.spacing(3.75),
    alignItems: 'center'
  },
  hint: {
    color: tokens.colors.tertiary
  },
});
