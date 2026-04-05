// Sessão dinâmica: percorre os cartões criados pelo usuário, com TTS e botões no rodapé
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  BackHandler,
  Image,
  PanResponder,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import type { GestureResponderEvent, PanResponderGestureState } from 'react-native';
import ScreenCornerShapes from '@app/components/ScreenCornerShapes';
import OrganicBlobs from '@app/components/OrganicBlobs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SessionStackParamList } from '@app/navigation/SessionNavigator';
import { useTranslation } from 'react-i18next';
import { useCardsStore } from '@app/state/useCardsStore';
import type { Card } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';
import SpeakButton from '@app/components/SpeakButton';
import { useSettingsStore } from '@app/state/useSettingsStore';
import BreathCard from '@app/components/BreathCard';
import EmergencyButton from '@app/components/EmergencyButton';
import * as audioService from '@app/utils/audioService';

type SessionItem = { type: 'card'; data: Card } | { type: 'breath' };

function toSentenceCase(value: string) {
  const normalized = value.trim();
  if (!normalized) return '';
  return normalized.charAt(0).toLocaleUpperCase('pt-BR') + normalized.slice(1).toLocaleLowerCase('pt-BR');
}

export default function UserCardsSession() {
  const { t } = useTranslation(['cards', 'app']);
  const navigation = useNavigation<NativeStackNavigationProp<SessionStackParamList>>();
  const { width } = useWindowDimensions();
  const { cards, hydrate } = useCardsStore();
  const { autoReadCards, breathCycles, breathListIndex } = useSettingsStore();
  const [index, setIndex] = useState(0);

  // Bloquear botão físico de voltar durante a sessão
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => () => { void audioService.stop(); }, []);

  // Usa a ordem persistida pelo usuário na lista
  const ordered = useMemo(() => cards, [cards]);

  // Itens da sessão: insere respiração na posição configurada
  const sessionItems = useMemo<SessionItem[]>(() => {
    const items: SessionItem[] = ordered.map(c => ({ type: 'card', data: c }));
    const idx = Math.max(0, Math.min(breathListIndex ?? 0, items.length));
    items.splice(idx, 0, { type: 'breath' });
    return items;
  }, [ordered, breathListIndex]);

  const current = sessionItems[index];
  const [waveSeed, setWaveSeed] = useState<number>(Date.now());
  const total = sessionItems.length;
  const progress = total > 0 ? (index + 1) / total : 0;
  const contentWidth = Math.max(width - tokens.spacing(6), 1);
  const lastInteractionWasSwipe = useRef(false);

  const goNext = useCallback(() => {
    void audioService.stop();
    setIndex(previousIndex => ((previousIndex + 1) % Math.max(1, total)));
  }, [total]);

  const goPrevious = useCallback(() => {
    void audioService.stop();
    setIndex(previousIndex => (previousIndex - 1 + Math.max(1, total)) % Math.max(1, total));
  }, [total]);

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
    [goNext, goPrevious]
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
    [handleSwipe]
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
    [contentWidth, goNext, goPrevious]
  );

  // Atualiza seed dos blobs/ondas a cada troca de item para variar o visual
  useEffect(() => { setWaveSeed(Date.now() + Math.floor(Math.random() * 1000000)); }, [index, current?.type]);

  // Auto TTS controlado pela preferência (padrão desligado) — apenas para cartões de texto
  useEffect(() => {
    if (!autoReadCards) return;
    if (!current) return;
    if (current.type !== 'card') return;
    void audioService.play(current.data);
  }, [current, autoReadCards]);

  // Considera apenas se não houver cartões do usuário (ainda haverá o card de respiração)
  if (ordered.length === 0) {
    return (
      <View style={styles.container}>
        <EmergencyButton />
        <View style={styles.content}>
          <BreathCard />
          <Text style={[styles.title, { marginTop: 12 }]}>{t('user.empty', 'Nenhum cartão ainda')}</Text>
          <Text style={styles.subtitle}>{t('user.add', 'Adicionar cartão')}</Text>
        </View>
        <View style={styles.footer}>
          <BigButton
            label={t('common.goHome', { ns: 'app' })}
            onPress={() => navigation.getParent()?.goBack()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmergencyButton />
      <ScreenCornerShapes />
      <OrganicBlobs
        seed={waveSeed}
        count={7}
        opacity={0.07}
        variance={0.55}
        safeTop={100}
        safeBottom={80}
        safeSides={30}
      />
      <View style={styles.header}>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityLabel={t('cards:sessionProgress', 'Progresso da sessão')}
          accessibilityValue={{
            min: 0,
            max: total,
            now: index + 1,
          }}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Pressable style={styles.content} onPress={handleContentPress} {...panResponder.panHandlers}>
        {current?.type === 'breath' ? (
          <BreathCard cycles={breathCycles} />
        ) : (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {toSentenceCase(current.data.title)}
            </Text>
            {(current.data.imageBase64 || current.data.imageUri) ? (
              <Image
                source={{ uri: current.data.imageBase64 ? `data:image/jpeg;base64,${current.data.imageBase64}` : current.data.imageUri }}
                style={styles.hero}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.subtitle}>{current.data.body}</Text>
            <SpeakButton text={current.data.body} style={{ marginTop: 12 }} />
          </>
        )}
      </Pressable>
      <View style={styles.footer}>
        <Text style={styles.navigationHint}>
          {t('user.sessionNavigationHint', 'Deslize ou toque na tela para navegar')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.end', { ns: 'app' })}
          style={({ pressed }) => [styles.endAction, pressed ? styles.endActionPressed : null]}
          onPress={() => {
            void audioService.stop();
            navigation.navigate('SessionEnd');
          }}
        >
          <Text style={styles.endActionText}>{t('common.end', { ns: 'app' })}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24, position: 'relative' },
  header: {
    minHeight: tokens.spacing(1.75),
    justifyContent: 'flex-start',
    marginTop: -tokens.spacing(1.5),
    marginBottom: tokens.spacing(0.25),
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
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
  title: {
    color: tokens.colors.text,
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Lemondrop-Bold',
  },
  subtitle: { color: tokens.colors.textMuted, fontSize: 16, textAlign: 'center' },
  footer: { gap: 4, paddingBottom: 8 },
  hero: { width: '100%', height: 220, borderRadius: 12, marginVertical: 12 },
  navigationHint: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.label,
    textAlign: 'center',
  },
  endAction: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing(1),
    paddingVertical: tokens.spacing(0.5),
  },
  endActionPressed: {
    opacity: 0.7,
  },
  endActionText: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.sizes.body,
    fontFamily: tokens.typography.weights.regular,
  },
});
