// Estado da sessão guiada (início/fim e passo atual)
import { create } from 'zustand';

type SessionState = {
  active: boolean;
  step: 'Breath' | 'Grounding54321' | 'Affirmations' | 'SessionEnd';
  start: () => void;
  next: () => void;
  end: () => void;
};

export const useSessionStore = create<SessionState>(set => ({
  active: false,
  step: 'Breath',
  start: () => set({ active: true, step: 'Breath' }),
  next: () =>
    set(state => {
      const order = ['Breath', 'Grounding54321', 'Affirmations', 'SessionEnd'] as const;
      const idx = order.indexOf(state.step as any);
      return { step: order[Math.min(idx + 1, order.length - 1)] } as any;
    }),
  end: () => set({ active: false, step: 'SessionEnd' })
}));

