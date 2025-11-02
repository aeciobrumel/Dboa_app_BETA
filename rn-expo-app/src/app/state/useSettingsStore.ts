// Store global de preferências (Zustand) com persistência
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsState = {
  language: 'pt-BR' | 'es';
  bgVolume: number; // 0..1
  narrationVolume: number; // 0..1
  bgEnabled: boolean;
  bgMusicUri?: string; // música personalizada do usuário (file://, content://, web url)
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  autoReadCards: boolean; // ler cartões automaticamente na sessão
  breathCycles: number; // ciclos do card de respiração
  breathListIndex: number; // posição do card de respiração na lista/sessão
  ttsVoice: 'auto' | 'male' | 'female';
  ttsRate: number; // 0.5..1.5 (aplicamos clamp)
  ttsPitch: number; // 0.5..1.5
  duck: number; // 0..1 multiplicador de volume durante narração
  setPreferences: (p: Partial<SettingsState>) => void;
  hydrate: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'pt-BR',
  bgVolume: 0.5,
  bgEnabled: true,
  narrationVolume: 0.8,
  hapticsEnabled: true,
  telemetryOptIn: false,
  autoReadCards: false,
  breathCycles: 4,
  breathListIndex: 0,
  ttsVoice: 'auto',
  ttsRate: 0.5,
  ttsPitch: 0.5,
  duck: 1,
  setPreferences: p => {
    set(p);
    AsyncStorage.setItem('settings', JSON.stringify({ ...get(), ...p })).catch(() => {});
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem('settings');
      if (raw) set(JSON.parse(raw));
    } catch {}
  }
}));
