// Utilitário para anunciar mensagens para leitores de tela
import { AccessibilityInfo } from 'react-native';
export const announce = (msg: string) => AccessibilityInfo.announceForAccessibility(msg);

