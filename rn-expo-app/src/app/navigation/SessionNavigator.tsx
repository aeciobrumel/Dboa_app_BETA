// Stack de sessão: cartões de exercícios (Respiração, 5-4-3-2-1, Afirmações)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Breath from '@app/screens/session/Breath';
import Grounding54321 from '@app/screens/session/Grounding54321';
import Affirmations from '@app/screens/session/Affirmations';
import SessionEnd from '@app/screens/session/SessionEnd';
import UserCardsSession from '@app/screens/session/UserCardsSession';

export type SessionStackParamList = {
  UserCardsSession: undefined;
  Breath: undefined;
  Grounding54321: undefined;
  Affirmations: undefined;
  SessionEnd: undefined;
};

const Stack = createNativeStackNavigator<SessionStackParamList>();

export function SessionNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false // Bloqueia gestos para evitar saída acidental
      }}
    >
      {/* Inicia pela sessão dinâmica de cartões do usuário (primeiro card será respiração) */}
      <Stack.Screen name="UserCardsSession" component={UserCardsSession} />
      {/* Tela dedicada de respiração continua disponível caso precise acessar diretamente */}
      <Stack.Screen name="Breath" component={Breath} />
      <Stack.Screen name="Grounding54321" component={Grounding54321} />
      <Stack.Screen name="Affirmations" component={Affirmations} />
      <Stack.Screen name="SessionEnd" component={SessionEnd} />
    </Stack.Navigator>
  );
}
