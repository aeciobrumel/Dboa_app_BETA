// Store de cartões personalizados (CRUD) com persistência local
// Mantém UX simples para não interferir no fluxo de crise
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Card = {
  id: string;
  title: string;
  body: string;
  favorite?: boolean;
  color?: string; // opcional para futuro tema por cartão
  useBgMusic?: boolean; // se tocar trilha ao abrir
  createdAt: number;
  updatedAt: number;
};

type CardsState = {
  cards: Card[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addCard: (c: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCard: (id: string, patch: Partial<Card>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
};

const STORAGE_KEY = 'user_cards_v1';

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Card[] = JSON.parse(raw);
        set({ cards: parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  addCard: async c => {
    const id = Math.random().toString(36).slice(2);
    const now = Date.now();
    const item: Card = { id, createdAt: now, updatedAt: now, ...c } as Card;
    const cards = [item, ...get().cards];
    set({ cards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return id;
  },
  updateCard: async (id, patch) => {
    const cards = get().cards.map(c => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c));
    set({ cards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  },
  removeCard: async id => {
    const cards = get().cards.filter(c => c.id !== id);
    set({ cards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  },
  toggleFavorite: async id => {
    const cards = get().cards.map(c => (c.id === id ? { ...c, favorite: !c.favorite } : c));
    set({ cards });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }
}));

