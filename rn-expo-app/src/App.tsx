// App principal do Expo com navegação, tema, i18n e pré-carregamento offline.
import '../global.css';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { LogBox, Text, TextInput } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from '@app/navigation/RootNavigator';
import { i18nReady } from './app/i18n';
import { tokens } from '@app/theme/tokens';
import { ensureOfflineAssets } from '@app/utils/offline';
import { background, narration_breath_es, narration_breath_pt } from '@app/assets/audio/sources';
import { useFonts } from 'expo-font';
import { customFonts } from '@app/assets/fonts';
import GlobalBackgroundAudio from '@app/components/GlobalBackgroundAudio';
import ErrorBoundary from '@app/components/ErrorBoundary';
import { useCardsStore } from '@app/state/useCardsStore';
import { useSettingsStore } from '@app/state/useSettingsStore';

if (Platform.OS !== 'web') {
  // Evita problemas de exibição no Web com react-native-screens
  enableScreens(true);
}
SplashScreen.preventAutoHideAsync().catch(() => {});
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

type ComponentWithStyleDefault = {
  defaultProps?: {
    style?: unknown;
  };
};

export default function App() {
  // Força light mode
  const theme = useMemo(() => DefaultTheme, []);

  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    let active = true;

    // Pré-carrega assets críticos e espera as hidratações antes do primeiro render.
    const prepare = async () => {
      try {
        const modules = [background, narration_breath_pt, narration_breath_es].filter(Boolean) as number[];
        await Promise.all([
          i18nReady,
          useSettingsStore.getState().hydrate(),
          useCardsStore.getState().hydrate(),
          modules.length ? ensureOfflineAssets(modules) : Promise.resolve()
        ]);
      } catch (_) {
        // Em modo de desenvolvimento ou sem assets presentes, ignore
      } finally {
        if (active) {
          setIsReady(true);
        }
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepare();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    // Define fonte padrão globalmente quando carregada
    tokens.typography.fontFamily = 'Lemondrop';
    const textWithDefaults = Text as typeof Text & ComponentWithStyleDefault;
    const textInputWithDefaults = TextInput as typeof TextInput & ComponentWithStyleDefault;

    textWithDefaults.defaultProps = textWithDefaults.defaultProps || {};
    textWithDefaults.defaultProps.style = [{ fontFamily: 'Lemondrop' }, textWithDefaults.defaultProps.style].filter(Boolean);
    textInputWithDefaults.defaultProps = textInputWithDefaults.defaultProps || {};
    textInputWithDefaults.defaultProps.style = [{ fontFamily: 'Lemondrop' }, textInputWithDefaults.defaultProps.style].filter(Boolean);
  }, [fontsLoaded]);

  if (!isReady || !fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer theme={{ ...theme, colors: { ...theme.colors, primary: tokens.colors.primary, background: tokens.colors.bg } }}>
          <GlobalBackgroundAudio />
          <RootNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
