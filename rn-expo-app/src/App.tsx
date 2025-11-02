// App principal do Expo com navegação, tema, i18n e pré-carregamento offline.
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { LogBox, Text, TextInput } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from '@app/navigation/RootNavigator';
import './app/i18n';
import { tokens } from '@app/theme/tokens';
import { ensureOfflineAssets } from '@app/utils/offline';
import { background, narration_breath_es, narration_breath_pt } from '@app/assets/audio/sources';
import { useFonts } from 'expo-font';
import { customFonts } from '@app/assets/fonts';
import GlobalBackgroundAudio from '@app/components/GlobalBackgroundAudio';

if (Platform.OS !== 'web') {
  // Evita problemas de exibição no Web com react-native-screens
  enableScreens(true);
}
SplashScreen.preventAutoHideAsync().catch(() => {});
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default function App() {
  // Força light mode
  const theme = useMemo(() => DefaultTheme, []);

  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    // Pré-carrega assets críticos para offline (áudios e ícones)
    const prepare = async () => {
      try {
        const modules = [background, narration_breath_pt, narration_breath_es].filter(Boolean) as number[];
        if (modules.length) await ensureOfflineAssets(modules);
      } catch (_) {
        // Em modo de desenvolvimento ou sem assets presentes, ignore
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    // Define fonte padrão globalmente quando carregada
    tokens.typography.fontFamily = 'Lemondrop';
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [{ fontFamily: 'Lemondrop' }, Text.defaultProps.style].filter(Boolean);
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = [{ fontFamily: 'Lemondrop' }, TextInput.defaultProps.style].filter(Boolean);
  }, [fontsLoaded]);

  if (!isReady || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={{ ...theme, colors: { ...theme.colors, primary: tokens.colors.primary, background: tokens.colors.bg } }}>
        <GlobalBackgroundAudio />
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
