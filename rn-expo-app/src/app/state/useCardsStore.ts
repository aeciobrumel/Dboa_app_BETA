// Store de cartões personalizados (CRUD) com persistência validada
// Mantém UX simples para não interferir no fluxo de crise
import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type Card = {
  id: string;
  title: string;
  body: string;
  imageUri?: string;
  imageBase64?: string;
  favorite?: boolean;
  color?: string;
  useBgMusic?: boolean;
  createdAt: number;
  updatedAt: number;
};

type CardsPersistedState = {
  cards: Card[];
};

type CardsState = CardsPersistedState & {
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
const STORAGE_VERSION = 1;

const cardSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  imageUri: z.string().optional(),
  imageBase64: z.string().optional(),
  favorite: z.boolean().optional(),
  color: z.string().optional(),
  useBgMusic: z.boolean().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
});

const legacyCardsSchema = z.array(cardSchema);
const persistedCardsSchema = z.object({
  cards: z.array(cardSchema)
});

function createDefaultCards(): Card[] {
  const now = Date.now();
  return [
    { id: 'p1', title: 'Respire com calma', body: 'Inspire pelo nariz, expire pela boca. Sinta o ar.', createdAt: now, updatedAt: now, favorite: true },
    { id: 'p2', title: 'Você está seguro', body: 'Observe 5 coisas que vê ao redor.', createdAt: now, updatedAt: now },
    { id: 'p3', title: 'Tudo passa', body: 'As sensações mudam. Dê tempo a si mesmo.', createdAt: now, updatedAt: now },
    { id: 'p4', title: 'Eu consigo', body: 'Lembre um momento em que superou algo difícil.', createdAt: now, updatedAt: now },
    { id: 'p5', title: 'Âncora no presente', body: 'Note 4 toques, 3 sons, 2 cheiros, 1 sabor.', createdAt: now, updatedAt: now },
  ];
}

const defaultPersistedState = (): CardsPersistedState => ({
  cards: createDefaultCards()
});

const serializePersistedState = (state: CardsPersistedState) =>
  JSON.stringify({ state, version: STORAGE_VERSION });

const cardsStateStorage: StateStorage = {
  getItem: async name => {
    const raw = await AsyncStorage.getItem(name);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        const candidate = (parsed as { state: unknown }).state;
        const result = persistedCardsSchema.safeParse(candidate);

        if (result.success) {
          return serializePersistedState(result.data);
        }

        console.warn('[Cards] Persisted state inválido; restaurando padrão.');
        return serializePersistedState(defaultPersistedState());
      }

      const legacy = legacyCardsSchema.safeParse(parsed);
      if (legacy.success) {
        return serializePersistedState({ cards: legacy.data });
      }

      console.warn('[Cards] JSON legado inválido; restaurando padrão.');
    } catch (error) {
      console.warn('[Cards] Falha ao validar JSON salvo:', error);
    }

    return serializePersistedState(defaultPersistedState());
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: name => AsyncStorage.removeItem(name)
};

const cardsStorage = createJSONStorage<CardsPersistedState>(() => cardsStateStorage);

let rehydrateCardsStore: () => Promise<void> = async () => {};

export const useCardsStore = create<CardsState>()(
  persist(
    (set, get) => ({
      ...defaultPersistedState(),
      hydrated: false,
      hydrate: () => rehydrateCardsStore(),
      addCard: async c => {
        const now = Date.now();
        const item: Card = {
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
          ...c
        };

        set(state => ({ cards: [item, ...state.cards] }));
        return item.id;
      },
      updateCard: async (id, patch) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === id ? { ...card, ...patch, updatedAt: Date.now() } : card
          )
        }));
      },
      removeCard: async id => {
        set(state => ({
          cards: state.cards.filter(card => card.id !== id)
        }));
      },
      toggleFavorite: async id => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === id
              ? { ...card, favorite: !card.favorite, updatedAt: Date.now() }
              : card
          )
        }));
      },
      reorder: async next => {
        set({ cards: next });
      },
      restoreDefaults: async () => {
        set({ cards: createDefaultCards() });
      }
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: cardsStorage,
      partialize: state => ({ cards: state.cards }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.warn('[Cards] Falha ao hidratar cartões:', error);
        }
        useCardsStore.setState({ hydrated: true });
      }
    }
  )
);

rehydrateCardsStore = async () => {
  if (useCardsStore.persist.hasHydrated()) {
    if (!useCardsStore.getState().hydrated) {
      useCardsStore.setState({ hydrated: true });
    }
    return;
  }

  await useCardsStore.persist.rehydrate();
};
