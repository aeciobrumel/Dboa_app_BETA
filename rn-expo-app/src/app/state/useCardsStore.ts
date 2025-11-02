// Store de cartões personalizados (CRUD) com persistência local
// Mantém UX simples para não interferir no fluxo de crise
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Card = {
  id: string;
  title: string;
  body: string;
  imageUri?: string; // caminho/URI do arquivo (mobile)
  imageBase64?: string; // fallback para Web (data URI)
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
  reorder: (next: Card[]) => Promise<void>;
  restoreDefaults: () => Promise<void>;
};

const STORAGE_KEY = 'user_cards_v1';

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const seedKey = 'user_cards_seeded_v1';
      const seedFlag = await AsyncStorage.getItem(seedKey);
      if (raw) {
        const parsed: Card[] = JSON.parse(raw);
        if (parsed.length === 0 && !seedFlag) {
          const now = Date.now();
          const defaults: Card[] = [
            { id: 'p1', title: 'Respire com calma', body: 'Inspire pelo nariz, expire pela boca. Sinta o ar.', createdAt: now, updatedAt: now, favorite: true },
            { id: 'p2', title: 'Você está seguro', body: 'Observe 5 coisas que vê ao redor.', createdAt: now, updatedAt: now },
            { id: 'p3', title: 'Tudo passa', body: 'As sensações mudam. Dê tempo a si mesmo.', createdAt: now, updatedAt: now },
            { id: 'p4', title: 'Eu consigo', body: 'Lembre um momento em que superou algo difícil.', createdAt: now, updatedAt: now },
            { id: 'p5', title: 'Âncora no presente', body: 'Note 4 toques, 3 sons, 2 cheiros, 1 sabor.', createdAt: now, updatedAt: now }
          ];
          set({ cards: defaults, hydrated: true });
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          await AsyncStorage.setItem(seedKey, '1');
        } else {
          set({ cards: parsed, hydrated: true });
        }
      } else {
        // Primeira execução sem storage: semeia defaults e marca flag
        const now = Date.now();
        const defaults: Card[] = [
          { id: 'p1', title: 'Respire com calma', body: 'Inspire pelo nariz, expire pela boca. Sinta o ar.', createdAt: now, updatedAt: now, favorite: true },
          { id: 'p2', title: 'Você está seguro', body: 'Observe 5 coisas que vê ao redor.', createdAt: now, updatedAt: now },
          { id: 'p3', title: 'Tudo passa', body: 'As sensações mudam. Dê tempo a si mesmo.', createdAt: now, updatedAt: now },
          { id: 'p4', title: 'Eu consigo', body: 'Lembre um momento em que superou algo difícil.', createdAt: now, updatedAt: now },
          { id: 'p5', title: 'Âncora no presente', body: 'Note 4 toques, 3 sons, 2 cheiros, 1 sabor.', createdAt: now, updatedAt: now }
        ];
        set({ cards: defaults, hydrated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        await AsyncStorage.setItem(seedKey, '1');
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
  },
  reorder: async (next) => {
    set({ cards: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  restoreDefaults: async () => {
    const now = Date.now();
    const defaults: Card[] = [
      { id: 'p1', title: 'Respire com calma', body: 'Inspire pelo nariz, expire pela boca. Sinta o ar.', createdAt: now, updatedAt: now, favorite: true },
      { id: 'p2', title: 'Você está seguro', body: 'Observe 5 coisas que vê ao redor.', createdAt: now, updatedAt: now },
      { id: 'p3', title: 'Tudo passa', body: 'As sensações mudam. Dê tempo a si mesmo.', createdAt: now, updatedAt: now },
      { id: 'p4', title: 'Eu consigo', body: 'Lembre um momento em que superou algo difícil.', createdAt: now, updatedAt: now },
      { id: 'p5', title: 'Âncora no presente', body: 'Note 4 toques, 3 sons, 2 cheiros, 1 sabor.', createdAt: now, updatedAt: now }
    ];
    set({ cards: defaults, hydrated: true });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    await AsyncStorage.setItem('user_cards_seeded_v1', '1');
  }
}));
