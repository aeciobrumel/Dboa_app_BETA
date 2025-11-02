// Fim da sessão: opção de encerrar rapidamente
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import { tokens } from '@app/theme/tokens';

export default function SessionEnd() {
  const navigation = useNavigation();
  const { t } = useTranslation(['app']);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('session.endTitle')}</Text>
      </View>
      <View style={styles.footer}>
        <BigButton label={t('common.goHome')} onPress={() => navigation.getParent()?.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: tokens.colors.text, fontSize: 24, textAlign: 'center', fontFamily: 'Lemondrop-Bold' },
  footer: { paddingBottom: 8 }
});
