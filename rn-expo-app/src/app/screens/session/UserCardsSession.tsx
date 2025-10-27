// Sessão dinâmica: percorre os cartões criados pelo usuário, com TTS e botões no rodapé
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCardsStore } from '@app/state/useCardsStore';
import { tokens } from '@app/theme/tokens';
import BigButton from '@app/components/BigButton';
import SpeakButton from '@app/components/SpeakButton';
import { speak, stopSpeaking } from '@app/utils/speak';

export default function UserCardsSession() {
  const { t } = useTranslation(['cards', 'app']);
  const navigation = useNavigation();
  const { cards, hydrate } = useCardsStore();
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

  const sorted = useMemo(() => {
    // Favoritos primeiro, depois por atualização
    return [...cards].sort((a, b) => (Number(b.favorite) - Number(a.favorite)) || b.updatedAt - a.updatedAt);
  }, [cards]);

  const current = sorted[index];
  const total = sorted.length;
  const isLast = index >= total - 1;

  // Auto TTS: ao entrar na tela e quando mudar de cartão
  useEffect(() => {
    if (!current) return;
    const text = `${current.title}. ${current.body}`.trim();
    if (text) speak(text);
  }, [current]);

  if (total === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('user.empty', 'Nenhum cartão ainda')}</Text>
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
      <View style={styles.content}>
        <Text style={styles.step}>{`${index + 1}/${total}`}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {current.title}
        </Text>
        <Text style={styles.subtitle}>{current.body}</Text>
        <SpeakButton text={`${current.title}. ${current.body}`} style={{ marginTop: 12 }} />
      </View>
      <View style={styles.footer}>
        {!isLast ? (
          <BigButton
            label={t('common.next', { ns: 'app' })}
            onPress={() => {
              stopSpeaking();
              setIndex(p => p + 1);
            }}
          />
        ) : (
          <BigButton
            label={t('common.finish', { ns: 'app' })}
            onPress={() => {
              stopSpeaking();
              navigation.navigate('SessionEnd' as never);
            }}
          />
        )}
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
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  step: { color: tokens.colors.textMuted, marginBottom: 4 },
  title: { color: tokens.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: tokens.colors.textMuted, fontSize: 16, textAlign: 'center' },
  footer: { gap: 8, paddingBottom: 8 }
});
