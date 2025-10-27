// Utilidades de armazenamento
import AsyncStorage from '@react-native-async-storage/async-storage';
export const saveJSON = async (key: string, value: unknown) =>
  AsyncStorage.setItem(key, JSON.stringify(value));
export const readJSON = async <T,>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
};

