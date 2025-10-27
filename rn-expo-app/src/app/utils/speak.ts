// Utilitário de TTS (texto em voz) com expo-speech e fallback no Web
import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';
import i18n from '@app/i18n';

const mapLanguage = (lng?: string) => {
  switch (lng) {
    case 'pt-BR':
      return 'pt-BR';
    case 'es':
      return 'es-ES';
    default:
      return 'pt-BR';
  }
};

export function speak(text: string) {
  const lang = mapLanguage(i18n.language);
  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as any;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      synth.cancel();
      synth.speak(utter);
      return;
    } catch {
      return;
    }
  }
  try {
    ExpoSpeech.stop();
    ExpoSpeech.speak(text, { language: lang });
  } catch {}
}

export function stopSpeaking() {
  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as any;
      synth?.cancel();
    } catch {}
    return;
  }
  try {
    ExpoSpeech.stop();
  } catch {}
}
