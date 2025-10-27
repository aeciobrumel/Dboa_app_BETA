// Anunciador para leitores de tela (voz acessível)
import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export default function AccessibilityAnnouncer({ message }: { message: string }) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
  return null;
}

