import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type EmergencyContactApp = 'whatsapp' | 'sms';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  app: EmergencyContactApp;
};

type ContactsPersistedState = {
  contacts: EmergencyContact[];
};

type ContactsState = ContactsPersistedState & {
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, patch: Partial<Omit<EmergencyContact, 'id'>>) => void;
};

const STORAGE_KEY = 'emergency_contacts_v1';
const STORAGE_VERSION = 1;
const MAX_CONTACTS = 3;

const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  app: z.enum(['whatsapp', 'sms']),
});

const persistedContactsSchema = z.object({
  contacts: z.array(contactSchema).max(MAX_CONTACTS),
});

const defaultPersistedState = (): ContactsPersistedState => ({
  contacts: [],
});

const serializePersistedState = (state: ContactsPersistedState) =>
  JSON.stringify({ state, version: STORAGE_VERSION });

const contactsStateStorage: StateStorage = {
  getItem: async name => {
    const raw = await AsyncStorage.getItem(name);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        const candidate = (parsed as { state: unknown }).state;
        const result = persistedContactsSchema.safeParse(candidate);

        if (result.success) {
          return serializePersistedState(result.data);
        }
      }
    } catch (error) {
      console.warn('[Contacts] Falha ao validar JSON salvo:', error);
    }

    return serializePersistedState(defaultPersistedState());
  },
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: name => AsyncStorage.removeItem(name),
};

const contactsStorage = createJSONStorage<ContactsPersistedState>(() => contactsStateStorage);

export const useContactsStore = create<ContactsState>()(
  persist(
    set => ({
      ...defaultPersistedState(),
      addContact: contact =>
        set(state => {
          if (state.contacts.length >= MAX_CONTACTS) {
            return state;
          }

          return {
            contacts: [...state.contacts, { id: randomUUID(), ...contact }],
          };
        }),
      removeContact: id =>
        set(state => ({
          contacts: state.contacts.filter(contact => contact.id !== id),
        })),
      updateContact: (id, patch) =>
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === id ? { ...contact, ...patch } : contact
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: contactsStorage,
      partialize: state => ({ contacts: state.contacts.slice(0, MAX_CONTACTS) }),
    }
  )
);
