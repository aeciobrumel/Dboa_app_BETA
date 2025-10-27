// Configuração i18next com namespaces e PT-BR/ES
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '@app/state/useSettingsStore';

const resources = {
  'pt-BR': {
    app: require('./locales/pt-BR/app.json'),
    cards: require('./locales/pt-BR/cards.json'),
    onboarding: require('./locales/pt-BR/onboarding.json'),
    settings: require('./locales/pt-BR/settings.json')
  },
  es: {
    app: require('./locales/es/app.json'),
    cards: require('./locales/es/cards.json'),
    onboarding: require('./locales/es/onboarding.json'),
    settings: require('./locales/es/settings.json')
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    ns: ['app', 'cards', 'onboarding', 'settings'],
    defaultNS: 'app',
    interpolation: { escapeValue: false }
  });

// Persistência manual de idioma + integração com Zustand
const origChange = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng?: string) => {
  const target = lng ?? 'pt-BR';
  await AsyncStorage.setItem('language', target);
  useSettingsStore.getState().setPreferences({ language: target as any });
  return origChange(target);
};

// Hidrata linguagem salva ao iniciar
(async () => {
  try {
    const saved = await AsyncStorage.getItem('language');
    if (saved) await i18n.changeLanguage(saved);
  } catch {}
})();

export default i18n;

