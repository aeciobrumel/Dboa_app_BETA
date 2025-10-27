// Utilitário para vibração curta, seguro no Web (no-op)
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const tap = async () => {
  if (Platform.OS === 'web') return; // Haptics não disponível no Web
  try {
    await Haptics.selectionAsync();
  } catch {
    // Ignora indisponibilidade em plataformas sem suporte
  }
};
