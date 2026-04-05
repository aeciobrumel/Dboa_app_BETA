import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation/RootNavigator';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import LanguageToggle from '@app/components/LanguageToggle';
import { tokens } from '@app/theme/tokens';
import { announce } from '@app/utils/accessibility';

function PulseDot() {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim, pulseOpacity]);

  return (
    <View style={styles.pulseWrap}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View style={styles.pulseDot} />
    </View>
  );
}

export default function Home() {
  const { t } = useTranslation('app');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hour = new Date().getHours();
  const greeting =
    hour <= 11
      ? t('home.goodMorning', 'Bom dia')
      : hour <= 17
        ? t('home.goodAfternoon', 'Boa tarde')
        : t('home.goodEvening', 'Boa noite');

  const startNow = useCallback(() => {
    announce(t('a11y.startingSession'));
    navigation.navigate('Session');
  }, [navigation, t]);

  const startCrisisMode = useCallback(() => {
    announce(t('a11y.startingCrisisMode', 'Abrindo modo crise'));
    navigation.navigate('CrisisMode');
  }, [navigation, t]);

  return (
    <SafeAreaView style={styles.container} accessibilityLabel={t('home.accessibilityLabel')}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topRow}>
        <LanguageToggle />
      </View>

      <View style={styles.centerSection}>
        <View style={styles.heroBlock}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/svg/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityRole="image"
              accessibilityLabel={t('home.mascotA11y', "Mascote D'Boa - sol sorridente")}
            />
            <Text style={styles.supportLine}>{t('home.supportLine', 'tudo bem vai passar')}</Text>
          </View>

          <View
            style={styles.greetingCard}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${greeting}. ${t('home.greetingQuestion', 'Como você está agora?')} ${t('home.greetingSub', 'Seus cartões estão prontos quando precisar.')}`}
          >
            <Text style={styles.greetingEyebrow}>{greeting}</Text>
            <Text style={styles.greetingTitle}>
              {t('home.greetingQuestion', 'Como você está agora?')}
            </Text>
            <Text style={styles.greetingSub}>
              {t('home.greetingSub', 'Seus cartões estão prontos quando precisar.')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <BigButton
          label={t('home.crisisButton', 'Preciso de ajuda agora')}
          variant="secondary"
          onPress={startCrisisMode}
          accessibilityLabel={t('home.crisisButton', 'Preciso de ajuda agora')}
          accessibilityHint={t('home.crisisButtonHint', 'Abre o modo de ajuda imediata')}
          leftIcon={<PulseDot />}
          containerStyle={[styles.crisisButton, styles.compactButton]}
          labelStyle={styles.crisisButtonText}
        />
        <BigButton
          label={t('home.startButton', 'Começar agora')}
          onPress={startNow}
          accessibilityLabel={t('home.startButton', 'Começar agora')}
          accessibilityHint={t('home.startButtonHint', 'Inicia o protocolo de ajuda')}
          style={[styles.primaryButton, styles.compactButton]}
          textStyle={styles.buttonText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.bg,
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: tokens.spacing(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButton: {
    paddingVertical: tokens.spacing(2),
    borderRadius: tokens.spacing(1.75),
  },
  crisisButton: {
    marginVertical: 0,
    backgroundColor: tokens.colors.surfaceBlue,
    borderWidth: 1.5,
    borderColor: tokens.colors.secondary,
    borderRadius: 18,
  },
  footer: {
    gap: tokens.spacing(1.5),
    paddingHorizontal: tokens.spacing(3),
    paddingBottom: tokens.spacing(5),
  },
  greetingCard: {
    alignSelf: 'stretch',
    borderRadius: 20,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: tokens.spacing(3),
    paddingVertical: tokens.spacing(2),
    marginTop: tokens.spacing(1),
    marginHorizontal: tokens.spacing(2.5),
    alignItems: 'center',
  },
  greetingEyebrow: {
    color: tokens.colors.secondary,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  greetingSub: {
    marginTop: tokens.spacing(0.5),
    color: tokens.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  greetingTitle: {
    color: tokens.colors.primary,
    fontSize: tokens.typography.sizes.label,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: tokens.typography.weights.bold,
  },
  heroBlock: {
    width: '100%',
    alignItems: 'center',
    gap: tokens.spacing(1.5),
  },
  logo: {
    width: tokens.spacing(15),
    height: tokens.spacing(15),
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.primary,
  },
  pulseRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
  },
  pulseWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginVertical: 0,
  },
  buttonText: {
    fontSize: tokens.typography.sizes.label,
  },
  crisisButtonText: {
    fontSize: tokens.typography.sizes.label,
    color: tokens.colors.primary,
  },
  supportLine: {
    marginTop: tokens.spacing(0.5),
    color: tokens.colors.secondary,
    fontSize: 11,
    lineHeight: 15,
  },
  topRow: {
    alignItems: 'flex-end',
    paddingHorizontal: tokens.spacing(2),
    paddingTop: tokens.spacing(2),
  },
});
