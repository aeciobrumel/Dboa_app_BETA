// Toggle simples PT/ES com troca instantânea via i18next
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '@app/theme/tokens';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel="Idioma">
      <Text
        style={[styles.lang, i18n.language === 'pt-BR' && styles.active]}
        onPress={() => i18n.changeLanguage('pt-BR')}
        accessibilityRole="button"
        accessibilityLabel="Português do Brasil"
      >
        PT
      </Text>
      <Text
        style={[styles.lang, i18n.language === 'es' && styles.active]}
        onPress={() => i18n.changeLanguage('es')}
        accessibilityRole="button"
        accessibilityLabel="Español"
      >
        ES
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  lang: { color: tokens.colors.textMuted, fontSize: 16, fontWeight: '600' },
  active: { color: tokens.colors.primary, textDecorationLine: 'underline' }
});

