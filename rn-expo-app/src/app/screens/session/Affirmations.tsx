// Cartão: Afirmações positivas
import React, { useCallback } from 'react';
import { View, StyleSheet, Text, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';

export default function Affirmations() {
  const navigation = useNavigation();
  const { t } = useTranslation(['cards', 'app']);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('affirmations.title')}</Text>
        <Text style={styles.subtitle}>{t('affirmations.examples')}</Text>
      </View>
      <View style={styles.footer}>
        <BigButton label={t('common.finish')} onPress={() => navigation.navigate('SessionEnd' as never)} />
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
