// Store global de preferências (Zustand) com persistência
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsState = {
  language: 'pt-BR' | 'es';
  bgVolume: number; // 0..1
  narrationVolume: number; // 0..1
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  setPreferences: (p: Partial<SettingsState>) => void;
  hydrate: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'pt-BR',
  bgVolume: 0.5,
  narrationVolume: 0.8,
  hapticsEnabled: true,
  telemetryOptIn: false,
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

