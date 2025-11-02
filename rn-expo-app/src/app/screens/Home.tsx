// Home: seletor de idioma (PT/ES) e botão grande "Começar agora"
import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BigButton from '@app/components/BigButton';
import LanguageToggle from '@app/components/LanguageToggle';
import { tokens } from '@app/theme/tokens';
import { announce } from '@app/utils/accessibility';

export default function Home() {
  const { t } = useTranslation('app');
  const navigation = useNavigation();

  // Ação do botão principal: inicia a sessão guiada
  const startNow = useCallback(() => {
    announce(t('a11y.startingSession'));
    navigation.navigate('Session' as never);
  }, [navigation, t]);

  return (
    <View style={styles.container} accessibilityLabel={t('home.accessibilityLabel')}>
      <StatusBar barStyle="dark-content" />
      {/* Logo centralizado na Home */}
      <View style={styles.logoWrap}>
        <Image
          source={require('../../../assets/svg/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Logo"
        />
      </View>
      <View style={styles.langRow}>
        <LanguageToggle />
      </View>
      <View style={styles.footer}>
        <BigButton
          label={t('home.startNow')}
          onPress={startNow}
          accessibilityLabel={t('home.startNowA11y')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    padding: 24
  },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  logo: { width: '80%', maxWidth: 480, height: undefined, aspectRatio: 2.5 },
  langRow: {
    position: 'absolute',
    top: 24,
    right: 24
  },
  footer: {
    paddingBottom: 8
  }
});
