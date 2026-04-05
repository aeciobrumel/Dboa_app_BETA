// Store global de preferências (Zustand) com persistência validada
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type SettingsPreferences = {
  language: 'pt-BR' | 'es';
  bgVolume: number;
  narrationVolume: number;
  bgEnabled: boolean;
  bgMusicUri?: string;
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  autoReadCards: boolean;
  breathCycles: number;
  breathListIndex: number;
  ttsVoice: 'auto' | 'male' | 'female';
  ttsRate: number;
  ttsPitch: number;
  duck: number;
};

type SettingsState = SettingsPreferences & {
  hydrated: boolean;
  setPreferences: (p: Partial<SettingsPreferences>) => void;
  hydrate: () => Promise<void>;
};

const STORAGE_KEY = 'settings';
const STORAGE_VERSION = 1;

const settingsSchema = z.object({
  language: z.enum(['pt-BR', 'es']),
  bgVolume: z.number().min(0).max(1),
  narrationVolume: z.number().min(0).max(1),
  bgEnabled: z.boolean(),
  bgMusicUri: z.string().optional(),
  hapticsEnabled: z.boolean(),
  telemetryOptIn: z.boolean(),
  autoReadCards: z.boolean(),
  breathCycles: z.number().int().min(1).max(20),
  breathListIndex: z.number().int().min(0),
  ttsVoice: z.enum(['auto', 'male', 'female']),
  ttsRate: z.number().min(0.1).max(2),
  ttsPitch: z.number().min(0.1).max(2),
  duck: z.number().min(0).max(1)
});

const legacySettingsSchema = settingsSchema.partial();

const defaultSettings = (): SettingsPreferences => ({
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
  duck: 1
});

const serializePersistedState = (state: SettingsPreferences) =>
  JSON.stringify({ state, version: STORAGE_VERSION });

const settingsStateStorage: StateStorage = {
  getItem: async name => {
    const raw = await AsyncStorage.getItem(name);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;
      const defaults = defaultSettings();

      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        const candidate = (parsed as { state: unknown }).state;
        const result = legacySettingsSchema.safeParse(candidate);

        if (result.success) {
          return serializePersistedState({ ...defaults, ...result.data });
        }

        console.warn('[Settings] Persisted state inválido; restaurando padrão.');
        return serializePersistedState(defaults);
      }

      const legacy = legacySettingsSchema.safeParse(parsed);
      if (legacy.success) {
        return serializePersistedState({ ...defaults, ...legacy.data });
      }

      console.warn('[Settings] JSON legado inválido; restaurando padrão.');
    } catch (error) {
      console.warn('[Settings] Falha ao validar JSON salvo:', error);
    }

    return serializePersistedState(defaultSettings());
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: name => AsyncStorage.removeItem(name)
};

const settingsStorage = createJSONStorage<SettingsPreferences>(() => settingsStateStorage);

let rehydrateSettingsStore: () => Promise<void> = async () => {};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...defaultSettings(),
      hydrated: false,
      setPreferences: preferences => {
        set(preferences);
      },
      hydrate: () => rehydrateSettingsStore()
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: settingsStorage,
      partialize: state => ({
        language: state.language,
        bgVolume: state.bgVolume,
        narrationVolume: state.narrationVolume,
        bgEnabled: state.bgEnabled,
        bgMusicUri: state.bgMusicUri,
        hapticsEnabled: state.hapticsEnabled,
        telemetryOptIn: state.telemetryOptIn,
        autoReadCards: state.autoReadCards,
        breathCycles: state.breathCycles,
        breathListIndex: state.breathListIndex,
        ttsVoice: state.ttsVoice,
        ttsRate: state.ttsRate,
        ttsPitch: state.ttsPitch,
        duck: state.duck
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('[Settings] Falha ao hidratar preferências:', error);
        }
        useSettingsStore.setState({ hydrated: true });
      }
    }
  )
);

rehydrateSettingsStore = async () => {
  if (useSettingsStore.persist.hasHydrated()) {
    if (!useSettingsStore.getState().hydrated) {
      useSettingsStore.setState({ hydrated: true });
    }
    return;
  }

  await useSettingsStore.persist.rehydrate();
};
