// Estado da sessão guiada (início/fim e passo atual)
import { create } from 'zustand';

type Card = {
  id: string;
  title: string;
  text: string;
  createdAt: number;
};

type SessionState = {
  active: boolean;
  step: 'Breath' | 'Grounding54321' | 'Affirmations' | 'SessionEnd';
  cards: Card[];
  start: () => void;
  next: () => void;
  end: () => void;
  addCard: (c: Omit<Card, 'id' | 'createdAt'>) => void;
  removeCard: (id: string) => void;
  resetCards: () => void;
  reorderCards: (fromIndex: number, toIndex: number) => void; // <- novo
};

const initialCards: Card[] = [
  {
    id: 'card-breath',
    title: 'Exercício: Respiração quadrática',
    text: 'Pratique 4 ciclos: inspirar 4s → segurar 4s → expirar 4s → segurar 4s. Use a bola para guiar.',
    createdAt: Date.now()
  },
  {
    id: 'card-1',
    title: 'Respire com atenção',
    text: 'Lembre-se: a respiração te ancora no presente. Inspire devagar e perceba o ar.',
    createdAt: Date.now()
  },
  {
    id: 'card-2',
    title: 'Estamos seguros',
    text: 'Você está em um lugar seguro agora. Observe o que está ao seu redor.',
    createdAt: Date.now()
  },
  {
    id: 'card-3',
    title: 'Isso também passa',
    text: 'Sentimentos mudam. Permita que essa sensação passe, sem julgamentos.',
    createdAt: Date.now()
  },
  {
    id: 'card-4',
    title: 'Posso lidar com isso',
    text: 'Eu tenho recursos internos e externos para lidar com essa situação.',
    createdAt: Date.now()
  },
  {
    id: 'card-5',
    title: 'Foco no aqui e agora',
    text: 'Observe cinco coisas que você vê, quatro que pode tocar, três que pode ouvir…',
    createdAt: Date.now()
  }
];

export const useSessionStore = create<SessionState>(set => ({
  active: false,
  step: 'Breath',
  cards: initialCards,
  start: () => set({ active: true, step: 'Breath' }),
  next: () =>
    set(state => {
      const order = ['Breath', 'Grounding54321', 'Affirmations', 'SessionEnd'] as const;
      const idx = order.indexOf(state.step as any);
      return { step: order[Math.min(idx + 1, order.length - 1)] } as any;
    }),
  end: () => set({ active: false, step: 'SessionEnd' }),
  addCard: (c) =>
    set((s) => ({
      cards: [
        ...s.cards,
        { id: `card-${Date.now()}`, createdAt: Date.now(), ...c }
      ]
    })),
  removeCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
  resetCards: () => set(() => ({ cards: initialCards })),
  reorderCards: (fromIndex: number, toIndex: number) =>
    set((s) => {
      const arr = [...s.cards];
      if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) {
        return { cards: arr };
      }
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      return { cards: arr };
    })
}));

