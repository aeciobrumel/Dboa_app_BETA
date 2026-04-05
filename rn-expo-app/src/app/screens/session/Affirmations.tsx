// Cartão: Afirmações positivas
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, BackHandler, Animated, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SessionStackParamList } from '@app/navigation/SessionNavigator';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import EmergencyButton from '@app/components/EmergencyButton';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { speak, stopSpeaking } from '@app/utils/speak';
import { tap } from '@app/utils/haptics';

const AFFIRMATION_DURATION_MS = 8000;

export default function Affirmations() {
  const navigation = useNavigation<NativeStackNavigationProp<SessionStackParamList>>();
  const { t } = useTranslation('app');
  const { autoReadCards, hapticsEnabled } = useSettingsStore();
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const affirmations = useMemo(() => {
    const items = t('affirmations.items', { returnObjects: true });
    return Array.isArray(items)
      ? items.map(item => String(item))
      : [
          t('affirmations.fallback.0', 'Você é mais forte do que imagina'),
          t('affirmations.fallback.1', 'Isso vai passar'),
          t('affirmations.fallback.2', 'Você está seguro agora'),
          t('affirmations.fallback.3', 'Cada respiração te traz mais calma'),
          t('affirmations.fallback.4', 'Você merece cuidado e compaixão'),
        ];
  }, [t]);
  const currentAffirmation = affirmations[index] ?? affirmations[0];

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const finishFlow = useCallback(() => {
    stopSpeaking();
    navigation.navigate('UserCardsSession');
  }, [navigation]);

  const advanceAffirmation = useCallback(() => {
    stopSpeaking();

    if (hapticsEnabled) {
      void tap();
    }

    if (index >= affirmations.length - 1) {
      finishFlow();
      return;
    }

    setIndex(current => current + 1);
  }, [affirmations.length, finishFlow, hapticsEnabled, index]);

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [index, opacity]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      advanceAffirmation();
    }, AFFIRMATION_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [advanceAffirmation, index]);

  useEffect(() => {
    if (!autoReadCards) {
      return;
    }

    void speak(currentAffirmation);

    return () => {
      stopSpeaking();
    };
  }, [autoReadCards, currentAffirmation]);

  return (
    <View style={styles.container}>
      <EmergencyButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('affirmations.title', 'Afirmações')}</Text>
          <Text style={styles.counter}>
            {t('affirmations.counter', {
              current: index + 1,
              total: affirmations.length,
              defaultValue: '{{current}} de {{total}}',
            })}
          </Text>
          <Animated.View style={[styles.card, { opacity }]}>
            <Text style={styles.subtitle}>{currentAffirmation}</Text>
          </Animated.View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <BigButton
          label={
            index >= affirmations.length - 1
              ? t('common.finish', 'Concluir')
              : t('affirmations.next', 'Próxima')
          }
          onPress={advanceAffirmation}
          accessibilityLabel={t(
            'affirmations.nextA11y',
            'Avançar para a próxima afirmação positiva'
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
    borderRadius: 24,
    padding: tokens.spacing(3),
    borderWidth: 1,
    borderColor: tokens.colors.secondary,
  },
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
    gap: tokens.spacing(1.5),
  },
  counter: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    textAlign: 'center',
  },
  footer: {
    gap: tokens.spacing(1),
    paddingBottom: tokens.spacing(1),
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: tokens.spacing(5),
    paddingBottom: tokens.spacing(2),
  },
  subtitle: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    lineHeight: tokens.typography.sizes.h2 * tokens.typography.lineHeight.normal,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.sizes.h2,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
});
