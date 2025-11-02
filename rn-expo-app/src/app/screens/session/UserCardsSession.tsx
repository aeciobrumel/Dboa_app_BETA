// Sessão dinâmica: percorre os cartões criados pelo usuário, com TTS e botões no rodapé
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, BackHandler, Image } from 'react-native';
import ScreenCornerShapes from '@app/components/ScreenCornerShapes';
import OrganicBlobs from '@app/components/OrganicBlobs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCardsStore } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';
import SpeakButton from '@app/components/SpeakButton';
import { speak, stopSpeaking } from '@app/utils/speak';
import { useSettingsStore } from '@app/state/useSettingsStore';
import BreathCard from '@app/components/BreathCard';

export default function UserCardsSession() {
  const { t } = useTranslation(['cards', 'app']);
  const navigation = useNavigation();
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

  useEffect(() => () => stopSpeaking(), []);

  // Usa a ordem persistida pelo usuário na lista
  const ordered = useMemo(() => cards, [cards]);

  // Itens da sessão: insere respiração na posição configurada
  const sessionItems = useMemo(() => {
    const items = ordered.map(c => ({ type: 'card' as const, data: c }));
    const idx = Math.max(0, Math.min(breathListIndex ?? 0, items.length));
    items.splice(idx, 0, { type: 'breath' as const } as any);
    return items;
  }, [ordered, breathListIndex]);

  const current = sessionItems[index];
  const [waveSeed, setWaveSeed] = useState<number>(Date.now());
  const total = sessionItems.length;

  // Atualiza seed dos waves a cada troca de item para variar visual
  useEffect(() => { setWaveSeed(Date.now() + Math.floor(Math.random() * 1000000)); }, [index, current?.type]);

  // Auto TTS controlado pela preferência (padrão desligado) — apenas para cartões de texto
  useEffect(() => {
    if (!autoReadCards) return;
    if (!current) return;
    if (current.type !== 'card') return;
    const text = (current.data.body ?? '').trim();
    if (text) speak(text);
  }, [current, autoReadCards]);

  // Considera apenas se não houver cartões do usuário (ainda haverá o card de respiração)
  if (ordered.length === 0) {
    return (
      <View style={styles.container}>
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
      <View style={styles.content}>
        <Text style={styles.step}>{`${index + 1}/${total}`}</Text>
        {current?.type === 'breath' ? (
          <BreathCard cycles={breathCycles} />
        ) : (
          <>
            <Text style={styles.title} accessibilityRole="header">{current.data.title}</Text>
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
      </View>
      <View style={styles.footer}>
        <BigButton
          label={t('common.next', { ns: 'app' })}
          onPress={() => {
            stopSpeaking();
            // Avança e, ao chegar no fim, volta ao início (loop)
            setIndex(p => ((p + 1) % Math.max(1, total)));
          }}
        />
        <BigButton
          variant="secondary"
          label={t('common.end', { ns: 'app' })}
          onPress={() => {
            stopSpeaking();
            navigation.navigate('SessionEnd' as never);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24, position: 'relative' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  step: { color: tokens.colors.textMuted, marginBottom: 4 },
  title: { color: tokens.colors.text, fontSize: 24, textAlign: 'center', fontFamily: 'Lemondrop-Bold' },
  subtitle: { color: tokens.colors.textMuted, fontSize: 16, textAlign: 'center' },
  footer: { gap: 8, paddingBottom: 8 },
  hero: { width: '100%', height: 220, borderRadius: 12, marginVertical: 12 }
});
