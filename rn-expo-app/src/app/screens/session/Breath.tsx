// Cartão: Respiração guiada. Bloqueia botão voltar e gestos, reproduz narração + trilha
import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AudioPlayer from '@app/components/AudioPlayer';
import { background, narration_breath_es, narration_breath_pt } from '@app/assets/audio/sources';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';
import { useTranslation } from 'react-i18next';

export default function Breath() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(['cards', 'app']);

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
        <Text style={styles.subtitle}>{t('breath.subtitle')}</Text>
      </View>
      <View style={styles.footer}>
        <BigButton label={t('common.next')} onPress={() => navigation.navigate('Grounding54321' as never)} />
        <BigButton variant="secondary" label={t('common.end')} onPress={() => navigation.navigate('SessionEnd' as never)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { color: tokens.colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: tokens.colors.textMuted, fontSize: 16, textAlign: 'center' },
  footer: { gap: 8, paddingBottom: 8 }
});
