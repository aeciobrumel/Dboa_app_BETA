// Cartão: Respiração guiada. Bloqueia botão voltar e gestos, reproduz narração + trilha
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, BackHandler, Animated, AccessibilityInfo, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AudioPlayer from '@app/components/AudioPlayer';
import { background, narration_breath_es, narration_breath_pt } from '@app/assets/audio/sources';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export default function Breath() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(['cards', 'app']);
  const scale = useRef(new Animated.Value(1)).current;
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState<'inspire' | 'segura' | 'expire' | 'segura2' | 'done'>('inspire');
  const [running, setRunning] = useState(true);

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

  const animateTo = (toValue: number, duration: number) =>
    new Promise<void>((resolve) => {
      Animated.timing(scale, {
        toValue,
        duration,
        useNativeDriver: true
      }).start(() => resolve());
    });

  const boxBreath = async (cycles = 4) => {
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
    } catch (e) {
      // fallback silencioso em erro
      setStep('done');
      setRunning(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      // iniciar automaticamente ao montar
      boxBreath(4);
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <AudioPlayer
        backgroundSource={background}
        narrationSource={i18n.language === 'es' ? narration_breath_es : narration_breath_pt}
        loopBackground
        autoPlay
      />
      <View style={styles.content}>
        <Text style={styles.title}>{t('breath.title')}</Text>
        <Text style={styles.subtitle}>
          {running ? `Ciclo ${cycle} de 4 — ${step === 'inspire' ? 'Inspirar' : step === 'expire' ? 'Expirar' : 'Segurar'}` : 'Concluído'}
        </Text>
        <View style={styles.ballContainer}>
          <Animated.View
            accessibilityRole="image"
            accessibilityLabel={`Bola de respiração, estado: ${step}`}
            style={[
              styles.ball,
              {
                transform: [{ scale }]
              }
            ]}
          />
        </View>
        <View style={styles.controls}>
          {!running && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Continuar para o próximo exercício"
              style={styles.button}
              onPress={() => {
                // Após respirar, ir para os cartões personalizados
                navigation.navigate('UserCardsSession' as never);
              }}
            >
              <Text style={styles.buttonText}>Próximo</Text>
            </TouchableOpacity>
          )}
          {running && (
            <Text style={styles.hint}>Aguarde enquanto orientamos sua respiração (4 ciclos)</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1724',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
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
    backgroundColor: '#36507D'
  },
  controls: {
    marginTop: 30,
    alignItems: 'center'
  },
  hint: {
    color: '#B4B1C6'
  },
  button: {
    backgroundColor: '#F8DBD8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#36507D',
    fontWeight: '600'
  }
});
