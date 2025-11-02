// Utilitário de TTS (texto em voz) com expo-speech e fallback no Web
import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';
import i18n from '@app/i18n';
import { useSettingsStore } from '@app/state/useSettingsStore';

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

export async function speak(text: string) {
  const lang = mapLanguage(i18n.language);
  const { ttsVoice, ttsRate, ttsPitch } = useSettingsStore.getState();
  // Duck música de fundo enquanto fala
  try { useSettingsStore.setState({ duck: 0.35 }); } catch {}
  const mapRate = (v?: number) => 0.5 + Math.max(0, Math.min(1, v ?? 0.5));
  const mapPitch = (v?: number) => 0.5 + Math.max(0, Math.min(1, v ?? 0.5));
  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as any;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      // Ajustes de voz/pitch/rate no Web
      utter.rate = mapRate(ttsRate);
      utter.pitch = mapPitch(ttsPitch);
      const voices = synth.getVoices?.() || [];
      const preferred = voices.filter((v: any) => (v.lang || '').toLowerCase().startsWith(lang.toLowerCase()));
      const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const maleHints = ['male','masc','hombre','joao','miguel','felipe','daniel','carlos','pedro','rafael','manuel','victor','diego','antonio','javier'];
      const femaleHints = ['female','fem','mujer','maria','ana','sofia','isabela','isabella','camila','lucia','paula','fernanda','carla','helena','victoria'];
      const isMaleCode = (name: string) => /-(Standard|Wavenet)-[bBdDfF]\b/.test(name);
      const isFemaleCode = (name: string) => /-(Standard|Wavenet)-[aAcCeE]\b/.test(name);
      const pickByHints = (list: any[], hints: string[], codeCheck: (n: string)=>boolean) =>
        list.find(v => codeCheck(v.name)) || list.find(v => hints.some(h => norm(v.name).includes(h)));
      let chosen: any;
      if (ttsVoice === 'male') chosen = pickByHints(preferred, maleHints, isMaleCode) || preferred[0];
      else if (ttsVoice === 'female') chosen = pickByHints(preferred, femaleHints, isFemaleCode) || preferred[0];
      else chosen = preferred[0] || voices[0];
      if (chosen) utter.voice = chosen;
      synth.cancel();
      utter.onend = () => { try { useSettingsStore.setState({ duck: 1 }); } catch {} };
      synth.speak(utter);
      return;
    } catch {
      try { useSettingsStore.setState({ duck: 1 }); } catch {}
      return;
    }
  }
  try {
    ExpoSpeech.stop();
    // Busca voz nativa (quando disponível)
    let voiceId: string | undefined;
    try {
      const voices = await ExpoSpeech.getAvailableVoicesAsync?.();
      if (voices && voices.length) {
        const sameLang = voices.filter((v: any) => (v.language || '').toLowerCase().startsWith(lang.toLowerCase()));
        const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const maleHints = ['male','masc','hombre','joao','miguel','felipe','daniel','carlos','pedro','rafael','manuel','victor','diego','antonio','javier'];
        const femaleHints = ['female','fem','mujer','maria','ana','sofia','isabela','isabella','camila','lucia','paula','fernanda','carla','helena','victoria'];
        const isMaleCode = (name: string) => /-(Standard|Wavenet)-[bBdDfF]\b/.test(name);
        const isFemaleCode = (name: string) => /-(Standard|Wavenet)-[aAcCeE]\b/.test(name);
        const pickByHints = (list: any[], hints: string[], codeCheck: (n: string)=>boolean) =>
          list.find(v => codeCheck(v.name)) || list.find(v => hints.some(h => norm(v.name).includes(h)));
        let chosen: any;
        if (ttsVoice === 'male') chosen = pickByHints(sameLang, maleHints, isMaleCode) || sameLang[0];
        else if (ttsVoice === 'female') chosen = pickByHints(sameLang, femaleHints, isFemaleCode) || sameLang[0];
        else chosen = sameLang[0] || voices[0];
        voiceId = chosen?.identifier;
      }
    } catch {}
    ExpoSpeech.speak(text, {
      language: lang,
      rate: mapRate(ttsRate),
      pitch: mapPitch(ttsPitch),
      voice: voiceId
    } as any);
    // Restaura duck após um tempo aproximado (fallback) e via listener do speech nativo, se disponível
    const restore = () => { try { useSettingsStore.setState({ duck: 1 }); } catch {} };
    setTimeout(restore, 4000);
  } catch {}
}

// Verifica se há voz preferida (masc/fem) para o idioma atual
export async function preferredVoiceAvailable(): Promise<boolean> {
  const lang = mapLanguage(i18n.language);
  const { ttsVoice } = useSettingsStore.getState();
  if (ttsVoice === 'auto') return true;
  if (Platform.OS === 'web') {
    try {
      const synth = (window as any).speechSynthesis as any;
      const voices = synth?.getVoices?.() || [];
      const preferred = voices.filter((v: any) => (v.lang || '').toLowerCase().startsWith(lang.toLowerCase()));
      const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const maleHints = ['male','masc','hombre','joao','miguel','felipe','daniel','carlos','pedro','rafael','manuel','victor','diego','antonio','javier'];
      const femaleHints = ['female','fem','mujer','maria','ana','sofia','isabela','isabella','camila','lucia','paula','fernanda','carla','helena','victoria'];
      const isMaleCode = (name: string) => /-(Standard|Wavenet)-[bBdDfF]\b/.test(name);
      const isFemaleCode = (name: string) => /-(Standard|Wavenet)-[aAcCeE]\b/.test(name);
      const pickByHints = (list: any[], hints: string[], codeCheck: (n: string)=>boolean) =>
        list.find(v => codeCheck(v.name)) || list.find(v => hints.some(h => norm(v.name).includes(h)));
      if (ttsVoice === 'male') return !!pickByHints(preferred, maleHints, isMaleCode);
      if (ttsVoice === 'female') return !!pickByHints(preferred, femaleHints, isFemaleCode);
      return true;
    } catch { return true; }
  }
  try {
    const voices = await ExpoSpeech.getAvailableVoicesAsync?.();
    const sameLang = (voices || []).filter((v: any) => (v.language || '').toLowerCase().startsWith(lang.toLowerCase()));
    const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const maleHints = ['male','masc','hombre','joao','miguel','felipe','daniel','carlos','pedro','rafael','manuel','victor','diego','antonio','javier'];
    const femaleHints = ['female','fem','mujer','maria','ana','sofia','isabela','isabella','camila','lucia','paula','fernanda','carla','helena','victoria'];
    const isMaleCode = (name: string) => /-(Standard|Wavenet)-[bBdDfF]\b/.test(name);
    const isFemaleCode = (name: string) => /-(Standard|Wavenet)-[aAcCeE]\b/.test(name);
    const pickByHints = (list: any[], hints: string[], codeCheck: (n: string)=>boolean) =>
      list.find((v: any) => codeCheck(v.name)) || list.find((v: any) => hints.some(h => norm(v.name).includes(h)));
    if (ttsVoice === 'male') return !!pickByHints(sameLang, maleHints, isMaleCode);
    if (ttsVoice === 'female') return !!pickByHints(sameLang, femaleHints, isFemaleCode);
    return true;
  } catch { return true; }
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
