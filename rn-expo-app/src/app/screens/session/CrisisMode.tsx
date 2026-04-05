import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  GestureResponderEvent,
  Linking,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import EmergencyButton from '@app/components/EmergencyButton';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import { useCardsStore } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import * as audioService from '@app/utils/audioService';

type CrisisStep = 0 | 1 | 2 | 3;
type BreathPhaseKey = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

type PhoneCallIconProps = {
  color: string;
  size?: number;
  strokeWidth?: number;
};

function PhoneCallIcon({
  color,
  size = 18,
  strokeWidth = 2,
}: PhoneCallIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.63 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.48-1.29a2 2 0 0 1 2.11-.45c.84.3 1.71.51 2.6.63A2 2 0 0 1 22 16.92Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 4.5a5 5 0 0 1 5 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 1.5A8 8 0 0 1 22.5 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlayIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 6.6L17.8 12L8 17.4V6.6Z" fill={color} />
    </Svg>
  );
}

export default function CrisisMode() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('app');
  const { width } = useWindowDimensions();
  const { cards, hydrate } = useCardsStore();
  const [step, setStep] = useState<CrisisStep>(0);
  const [breathPhaseKey, setBreathPhaseKey] = useState<BreathPhaseKey>('inhale');
  const breathScale = useRef(new Animated.Value(0.7)).current;
  const lastInteractionWasSwipe = useRef(false);
  const crisisCards = useMemo(
    () => cards.filter(card => card.category === 'crise'),
    [cards],
  );
  const favoriteCards = useMemo(
    () => cards.filter(card => Boolean(card.favorite)),
    [cards],
  );
  const supportCards = useMemo(
    () => (crisisCards.length > 0 ? crisisCards : favoriteCards),
    [crisisCards, favoriteCards],
  );
  const hasSupportCards = supportCards.length > 0;
  const totalSteps = hasSupportCards ? 4 : 3;
  const lastStep = totalSteps - 1;
  const progress = (step + 1) / totalSteps;
  const contentWidth = Math.max(width - tokens.spacing(6), 1);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (step > lastStep) {
      setStep(lastStep as CrisisStep);
    }
  }, [lastStep, step]);

  const breathPhases = useMemo(
    () => [
      {
        key: 'inhale' as const,
        label: t('crisis.breath.inhale'),
        duration: 4000,
        animationDuration: 4000,
        targetScale: 1,
      },
      {
        key: 'holdFull' as const,
        label: t('crisis.breath.hold'),
        duration: 4000,
        animationDuration: 1,
        targetScale: 1,
      },
      {
        key: 'exhale' as const,
        label: t('crisis.breath.exhale'),
        duration: 6000,
        animationDuration: 6000,
        targetScale: 0.7,
      },
      {
        key: 'holdEmpty' as const,
        label: t('crisis.breath.hold'),
        duration: 2000,
        animationDuration: 1,
        targetScale: 0.7,
      },
    ],
    [t],
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const runPhase = (index: number) => {
      if (cancelled) {
        return;
      }

      const phase = breathPhases[index];
      setBreathPhaseKey(phase.key);

      Animated.timing(breathScale, {
        toValue: phase.targetScale,
        duration: phase.animationDuration,
        useNativeDriver: true,
      }).start();

      timeout = setTimeout(() => {
        runPhase((index + 1) % breathPhases.length);
      }, phase.duration);
    };

    if (step === 1) {
      breathScale.setValue(0.7);
      setBreathPhaseKey('inhale');
      runPhase(0);
    } else {
      breathScale.stopAnimation();
      breathScale.setValue(0.7);
      setBreathPhaseKey('inhale');
    }

    return () => {
      cancelled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      breathScale.stopAnimation();
    };
  }, [breathPhases, breathScale, step]);

  const openEmergencyLine = (phone: string) => {
    void Linking.openURL(`tel:${phone}`);
  };

  const goNext = useCallback(() => {
    if (step === lastStep) {
      navigation.popToTop();
      return;
    }

    setStep(previousStep => Math.min(previousStep + 1, lastStep) as CrisisStep);
  }, [lastStep, navigation, step]);

  const goPrevious = useCallback(() => {
    setStep(previousStep => Math.max(previousStep - 1, 0) as CrisisStep);
  }, []);

  const handleSwipe = useCallback(
    (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const horizontalThreshold = 36;
      const verticalAllowance = 18;

      if (Math.abs(gestureState.dx) < horizontalThreshold) {
        return false;
      }

      if (Math.abs(gestureState.dy) > verticalAllowance) {
        return false;
      }

      lastInteractionWasSwipe.current = true;

      if (gestureState.dx < 0) {
        goNext();
      } else {
        goPrevious();
      }

      return true;
    },
    [goNext, goPrevious],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: handleSwipe,
        onPanResponderTerminate: () => {
          lastInteractionWasSwipe.current = false;
        },
      }),
    [handleSwipe],
  );

  const handleContentPress = useCallback(
    (event: GestureResponderEvent) => {
      if (lastInteractionWasSwipe.current) {
        lastInteractionWasSwipe.current = false;
        return;
      }

      const { locationX } = event.nativeEvent;
      if (locationX < contentWidth / 2) {
        goPrevious();
        return;
      }

      goNext();
    },
    [contentWidth, goNext, goPrevious],
  );

  const currentBreathLabel =
    breathPhases.find(phase => phase.key === breathPhaseKey)?.label ?? breathPhases[0].label;

  const renderExitAction = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        step === lastStep
          ? t('crisis.backHome', 'Voltar ao início')
          : t('crisis.exitA11y', 'Sair do modo crise')
      }
      onPress={() => {
        if (step === lastStep) {
          navigation.popToTop();
          return;
        }

        navigation.goBack();
      }}
      style={styles.exitButton}
    >
      <Text style={styles.exitText}>
        {step === lastStep ? t('crisis.backHome', 'Voltar ao início') : t('crisis.exit')}
      </Text>
    </Pressable>
  );

  const renderEmergencyButton = () => (
    <EmergencyButton />
  );

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <View style={styles.contentBlock}>
          <Text style={styles.stepLabel}>{t('crisis.step1Label')}</Text>

          <Text style={styles.disclaimerText}>{t('crisis.disclaimer')}</Text>

          <View style={styles.emergencyCards}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('crisis.cvvA11yLabel')}
              accessibilityHint={t('crisis.cvvCallHint')}
              onPress={event => {
                event.stopPropagation();
                openEmergencyLine('188');
              }}
              style={({ pressed }) => [
                styles.emergencyCard,
                pressed ? styles.emergencyCardPressed : null,
              ]}
            >
              <View style={styles.emergencyCardTextColumn}>
                <Text style={styles.emergencyCardLabel}>{t('crisis.cvvLabel')}</Text>
                <Text style={styles.emergencyCardNumber}>188</Text>
              </View>

              <View style={styles.emergencyCardIconWrap}>
                <PhoneCallIcon color={tokens.colors.bg} size={22} strokeWidth={2} />
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('crisis.samuA11yLabel')}
              accessibilityHint={t('crisis.samuCallHint')}
              onPress={event => {
                event.stopPropagation();
                openEmergencyLine('192');
              }}
              style={({ pressed }) => [
                styles.emergencyCard,
                pressed ? styles.emergencyCardPressed : null,
              ]}
            >
              <View style={styles.emergencyCardTextColumn}>
                <Text style={styles.emergencyCardLabel}>{t('crisis.samuLabel')}</Text>
                <Text style={styles.emergencyCardNumber}>192</Text>
              </View>

              <View style={styles.emergencyCardIconWrap}>
                <PhoneCallIcon color={tokens.colors.bg} size={22} strokeWidth={2} />
              </View>
            </Pressable>
          </View>

          <Text style={styles.disclaimerSubText}>{t('crisis.disclaimerSub')}</Text>
        </View>
      );
    }

    if (step === 1) {
      return (
        <View style={styles.contentBlock}>
          <Text style={styles.stepLabel}>{t('crisis.step2Label')}</Text>

          <View style={styles.breathContent}>
            <Text style={styles.breathPhaseText}>{currentBreathLabel}</Text>

            <Animated.View
              style={[
                styles.breathBall,
                {
                  transform: [{ scale: breathScale }],
                },
              ]}
            />

            <Text style={styles.breathSubText}>{t('crisis.breathSub')}</Text>
            <Text style={styles.breathTipText}>{t('crisis.breathTip')}</Text>
          </View>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.contentBlock}>
          <Text style={styles.stepLabel}>{t('crisis.step3Label')}</Text>

          <View style={styles.anchorContent}>
            <Text style={styles.anchorText}>{t('crisis.anchorText')}</Text>

            <View style={styles.anchorTipCard}>
              <Text style={styles.anchorTipText}>{t('crisis.anchorTip')}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentBlock}>
        <Text style={styles.stepLabel}>Passo 4</Text>

        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Seus cartões de apoio</Text>
          <Text style={styles.supportDescription}>
            Você pode continuar com seus próprios cartões.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.supportCardsList}
          >
            {supportCards.map(card => (
              <View key={card.id} style={styles.supportCard}>
                <Text style={styles.supportCardBody}>{card.body}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvir cartão ${card.title}`}
                  onPress={event => {
                    event.stopPropagation();
                    void audioService.play(card);
                  }}
                  style={({ pressed }) => [
                    styles.supportPlayButton,
                    pressed ? styles.supportPlayButtonPressed : null,
                  ]}
                >
                  <PlayIcon color={tokens.colors.bg} size={16} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {step > 0 ? renderEmergencyButton() : null}
      <View style={styles.header}>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel={t('crisis.progressA11y', 'Progresso do modo crise')}
          accessibilityValue={{
            min: 0,
            max: totalSteps,
            now: step + 1,
          }}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <Pressable
        style={styles.gestureSurface}
        onPress={handleContentPress}
        {...panResponder.panHandlers}
      >
        <View style={styles.stepLayout}>
          {renderStepContent()}
          <View style={styles.actions}>
            <Text style={styles.navigationHint}>
              {t('crisis.navigationHint', 'Deslize ou toque na tela para navegar')}
            </Text>
            {renderExitAction()}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
    marginTop: tokens.spacing(2),
    gap: tokens.spacing(0.5),
  },
  anchorContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing(2),
  },
  anchorText: {
    color: tokens.colors.primary,
    fontSize: 24,
    lineHeight: 24 * 1.35,
    fontFamily: tokens.typography.weights.bold,
    textAlign: 'center',
  },
  anchorTipCard: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: tokens.colors.accent,
    paddingVertical: tokens.spacing(1.5),
    paddingHorizontal: tokens.spacing(2),
  },
  anchorTipText: {
    color: tokens.colors.text,
    fontSize: 12,
    lineHeight: 12 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
  },
  breathBall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.primary,
  },
  breathContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing(2),
  },
  breathPhaseText: {
    color: tokens.colors.primary,
    fontSize: 20,
    fontFamily: tokens.typography.weights.bold,
    textAlign: 'center',
  },
  breathSubText: {
    color: tokens.colors.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  breathTipText: {
    color: tokens.colors.textMuted,
    fontSize: 12,
    lineHeight: 12 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing(2),
  },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  gestureSurface: {
    flex: 1,
    paddingHorizontal: tokens.spacing(3),
    paddingTop: tokens.spacing(1.5),
    paddingBottom: tokens.spacing(3),
  },
  header: {
    paddingHorizontal: tokens.spacing(3),
    paddingTop: tokens.spacing(0.5),
  },
  progressTrack: {
    width: '100%',
    height: tokens.spacing(0.75),
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceBlue,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: tokens.colors.primary,
  },
  contentBlock: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  disclaimerSubText: {
    color: tokens.colors.textMuted,
    fontSize: 11,
    lineHeight: 11 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
  },
  disclaimerText: {
    color: tokens.colors.text,
    fontSize: 14,
    lineHeight: 14 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing(3),
  },
  emergencyCard: {
    width: '100%',
    backgroundColor: tokens.colors.primary,
    borderRadius: 16,
    paddingVertical: tokens.spacing(2),
    paddingHorizontal: tokens.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
    position: 'relative',
  },
  emergencyCardIconWrap: {
    position: 'absolute',
    right: tokens.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCardLabel: {
    color: tokens.colors.secondary,
    fontSize: 9,
    fontFamily: tokens.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'left',
  },
  emergencyCardNumber: {
    color: tokens.colors.bg,
    fontSize: 28,
    fontFamily: tokens.typography.weights.bold,
    lineHeight: 32,
    textAlign: 'left',
  },
  emergencyCardPressed: {
    backgroundColor: tokens.colors.primaryDark,
    opacity: 0.9,
  },
  emergencyCardTextColumn: {
    width: '100%',
    alignItems: 'center',
    gap: tokens.spacing(0.25),
  },
  emergencyCards: {
    width: '100%',
    gap: tokens.spacing(1),
  },
  exitButton: {
    alignItems: 'center',
  },
  exitText: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    textAlign: 'center',
    paddingVertical: tokens.spacing(1),
  },
  navigationHint: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    textAlign: 'center',
  },
  supportCard: {
    width: 240,
    minHeight: 170,
    borderRadius: 18,
    backgroundColor: tokens.colors.bg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceBlue,
    padding: tokens.spacing(2),
    justifyContent: 'space-between',
    gap: tokens.spacing(2),
  },
  supportCardBody: {
    color: tokens.colors.text,
    fontSize: 16,
    lineHeight: 16 * tokens.typography.lineHeight.normal,
    flexShrink: 1,
  },
  supportCardsList: {
    gap: tokens.spacing(1.5),
    paddingHorizontal: tokens.spacing(0.25),
  },
  supportContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: tokens.spacing(2),
  },
  supportDescription: {
    color: tokens.colors.textMuted,
    fontSize: 14,
    lineHeight: 14 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing(1),
  },
  supportPlayButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    backgroundColor: tokens.colors.primary,
  },
  supportPlayButtonPressed: {
    backgroundColor: tokens.colors.primaryDark,
  },
  supportTitle: {
    color: tokens.colors.primary,
    fontSize: 24,
    lineHeight: 24 * 1.2,
    fontFamily: tokens.typography.weights.bold,
    textAlign: 'center',
  },
  stepLabel: {
    color: tokens.colors.secondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingTop: tokens.spacing(1),
    marginBottom: tokens.spacing(3),
  },
  stepLayout: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing(3),
  },
});
