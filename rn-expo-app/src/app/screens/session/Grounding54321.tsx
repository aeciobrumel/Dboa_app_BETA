// Cartão: Técnica 5-4-3-2-1 (Grounding)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, BackHandler, Animated, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SessionStackParamList } from '@app/navigation/SessionNavigator';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import EmergencyButton from '@app/components/EmergencyButton';
import { speak, stopSpeaking } from '@app/utils/speak';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { tap } from '@app/utils/haptics';

const STEP_DURATION_MS = 15000;

type GroundingStep = {
  count: number;
  sense: string;
  instruction: string;
};

export default function Grounding54321() {
  const navigation = useNavigation<NativeStackNavigationProp<SessionStackParamList>>();
  const { t } = useTranslation('app');
  const { autoReadCards, hapticsEnabled } = useSettingsStore();
  const [stepIndex, setStepIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const stepReveal = useRef(new Animated.Value(0)).current;
  const steps = useMemo<GroundingStep[]>(
    () => [
      {
        count: 5,
        sense: t('grounding.steps.see.sense', 'coisas que você VÊ'),
        instruction: t('grounding.steps.see.instruction', 'Olhe ao redor e nomeie cinco coisas que você vê.'),
      },
      {
        count: 4,
        sense: t('grounding.steps.touch.sense', 'coisas que você TOCA'),
        instruction: t('grounding.steps.touch.instruction', 'Perceba quatro coisas que você pode tocar agora.'),
      },
      {
        count: 3,
        sense: t('grounding.steps.hear.sense', 'coisas que você OUVE'),
        instruction: t('grounding.steps.hear.instruction', 'Escute com calma e identifique três sons ao seu redor.'),
      },
      {
        count: 2,
        sense: t('grounding.steps.smell.sense', 'coisas que você CHEIRA'),
        instruction: t('grounding.steps.smell.instruction', 'Note dois cheiros ou sensações no ar.'),
      },
      {
        count: 1,
        sense: t('grounding.steps.taste.sense', 'coisas que você SABOREIA'),
        instruction: t('grounding.steps.taste.instruction', 'Perceba um gosto presente na boca ou na respiração.'),
      },
    ],
    [t]
  );
  const currentStep = steps[stepIndex];

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const advanceStep = useCallback(() => {
    stopSpeaking();

    if (hapticsEnabled) {
      void tap();
    }

    if (stepIndex >= steps.length - 1) {
      navigation.navigate('Affirmations');
      return;
    }

    setStepIndex(current => current + 1);
  }, [hapticsEnabled, navigation, stepIndex, steps.length]);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);

    const timer = Animated.timing(progress, {
      toValue: 1,
      duration: STEP_DURATION_MS,
      useNativeDriver: false,
    });

    timer.start(({ finished }) => {
      if (finished) {
        advanceStep();
      }
    });

    return () => {
      progress.stopAnimation();
    };
  }, [advanceStep, progress, stepIndex]);

  useEffect(() => {
    stepReveal.setValue(0);
    Animated.timing(stepReveal, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [stepIndex, stepReveal]);

  useEffect(() => {
    if (!autoReadCards) {
      return;
    }

    void speak(currentStep.instruction);

    return () => {
      stopSpeaking();
    };
  }, [autoReadCards, currentStep.instruction]);

  return (
    <View style={styles.container}>
      <EmergencyButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('grounding.title', 'Técnica 5-4-3-2-1')}</Text>
          <View style={styles.progressTrack} accessibilityRole="progressbar">
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Animated.View
            style={[
              styles.stepCard,
              {
                opacity: stepReveal,
                transform: [
                  {
                    scale: stepReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.stepCount}>{currentStep.count}</Text>
            <Text style={styles.stepSense}>{currentStep.sense}</Text>
            <Text style={styles.subtitle}>{currentStep.instruction}</Text>
          </Animated.View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <BigButton
          label={t('common.next', 'Próximo')}
          onPress={advanceStep}
          accessibilityLabel={t('grounding.nextA11y', 'Avançar para a próxima etapa do grounding')}
        />
        <BigButton
          variant="secondary"
          label={t('common.end', 'Encerrar')}
          onPress={() => navigation.navigate('SessionEnd')}
          accessibilityLabel={t('grounding.endA11y', 'Encerrar sessão agora')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: tokens.spacing(3),
    position: 'relative',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing(2),
  },
  footer: {
    gap: tokens.spacing(1),
    paddingBottom: tokens.spacing(1),
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
  },
  progressTrack: {
    width: '100%',
    height: tokens.spacing(0.75),
    borderRadius: 999,
    backgroundColor: tokens.colors.surface,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: tokens.spacing(5),
    paddingBottom: tokens.spacing(2),
  },
  stepCard: {
    width: '100%',
    backgroundColor: tokens.colors.surface,
    borderRadius: 24,
    padding: tokens.spacing(3),
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
    alignItems: 'center',
    gap: tokens.spacing(1),
  },
  stepCount: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.sizes.h1 * 2,
    fontFamily: tokens.typography.weights.bold,
    lineHeight: tokens.typography.sizes.h1 * 2,
  },
  stepSense: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
  subtitle: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h3,
    lineHeight: tokens.typography.sizes.h3 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
});
