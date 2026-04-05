// Utilitário de TTS (texto em voz) com expo-speech e fallback no Web
import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';
import i18n from '@app/i18n';
import { useSettingsStore } from '@app/state/useSettingsStore';

const mapLanguage = (lng?: string) => {
  switch (lng) {
    case 'es':
      return 'es-ES';
    default:
      return 'pt-BR';
  }
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const mapRate = (v?: number) => 0.5 + clamp(v ?? 0.5, 0, 1);
const mapPitch = (v?: number) => 0.5 + clamp(v ?? 0.5, 0, 1);

// --- Voice selection (shared between web and native) ---
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const MALE_HINTS = ['male','masc','hombre','joao','miguel','felipe','daniel','carlos','pedro','rafael','manuel','victor','diego','antonio','javier'];
const FEMALE_HINTS = ['female','fem','mujer','maria','ana','sofia','isabela','isabella','camila','lucia','paula','fernanda','carla','helena','victoria'];
const isMaleCode = (name: string) => /-(Standard|Wavenet)-[bBdDfF]\b/.test(name);
const isFemaleCode = (name: string) => /-(Standard|Wavenet)-[aAcCeE]\b/.test(name);

function pickVoice<T extends { name: string }>(
  voices: T[],
  preference: 'auto' | 'male' | 'female'
): T | undefined {
  if (preference === 'auto' || voices.length === 0) return voices[0];
  const hints = preference === 'male' ? MALE_HINTS : FEMALE_HINTS;
  const codeCheck = preference === 'male' ? isMaleCode : isFemaleCode;
  return (
    voices.find(v => codeCheck(v.name)) ||
    voices.find(v => hints.some(h => norm(v.name).includes(h))) ||
    voices[0]
  );
}

function filterByLang<T extends { lang?: string; language?: string }>(voices: T[], lang: string): T[] {
  const prefix = lang.toLowerCase();
  return voices.filter(v => ((v.lang || v.language || '') as string).toLowerCase().startsWith(prefix));
}

function setDuck(value: number) {
  try { useSettingsStore.setState({ duck: value }); } catch (e) {
    console.warn('[TTS] Falha ao ajustar duck:', e);
  }
}

function restoreDuck() { setDuck(1); }

export async function speak(text: string) {
  const lang = mapLanguage(i18n.language);
  const { ttsVoice, ttsRate, ttsPitch } = useSettingsStore.getState();
  setDuck(0.35);

  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = mapRate(ttsRate);
      utter.pitch = mapPitch(ttsPitch);
      const voices = synth.getVoices?.() || [];
      const preferred = filterByLang(voices.map(v => ({ ...v, name: v.name, lang: v.lang })), lang);
      const chosen = pickVoice(preferred as any, ttsVoice);
      if (chosen) utter.voice = voices.find(v => v.name === (chosen as any).name) || null;
      synth.cancel();
      utter.onend = restoreDuck;
      utter.onerror = restoreDuck;
      synth.speak(utter);
    } catch (e) {
      console.warn('[TTS] Erro no Web Speech:', e);
      restoreDuck();
    }
    return;
  }

  try {
    ExpoSpeech.stop();
    let voiceId: string | undefined;
    try {
      const voices = await ExpoSpeech.getAvailableVoicesAsync?.();
      if (voices?.length) {
        const sameLang = filterByLang(voices as any[], lang);
        const chosen = pickVoice(sameLang as any, ttsVoice);
        voiceId = (chosen as any)?.identifier;
      }
    } catch (e) {
      console.warn('[TTS] Falha ao buscar vozes nativas:', e);
    }
    ExpoSpeech.speak(text, {
      language: lang,
      rate: mapRate(ttsRate),
      pitch: mapPitch(ttsPitch),
      voice: voiceId,
      onDone: restoreDuck,
      onError: restoreDuck,
    } as any);
  } catch (e) {
    console.warn('[TTS] Erro ao falar:', e);
    restoreDuck();
  }
}

export async function preferredVoiceAvailable(): Promise<boolean> {
  const lang = mapLanguage(i18n.language);
  const { ttsVoice } = useSettingsStore.getState();
  if (ttsVoice === 'auto') return true;

  try {
    if (Platform.OS === 'web') {
      const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
      const voices = synth?.getVoices?.() || [];
      const preferred = filterByLang(voices.map(v => ({ ...v, name: v.name, lang: v.lang })), lang);
      const chosen = pickVoice(preferred as any, ttsVoice);
      return !!chosen && chosen !== preferred[0];
    }
    const voices = await ExpoSpeech.getAvailableVoicesAsync?.();
    const sameLang = filterByLang((voices || []) as any[], lang);
    const chosen = pickVoice(sameLang as any, ttsVoice);
    return !!chosen && chosen !== sameLang[0];
  } catch {
    return true;
  }
}

export function stopSpeaking() {
  if (Platform.OS === 'web') {
    try {
      (window as any).speechSynthesis?.cancel();
    } catch (e) {
      console.warn('[TTS] Erro ao parar Web Speech:', e);
    }
    return;
  }
  try {
    ExpoSpeech.stop();
  } catch (e) {
    console.warn('[TTS] Erro ao parar:', e);
  }
}
