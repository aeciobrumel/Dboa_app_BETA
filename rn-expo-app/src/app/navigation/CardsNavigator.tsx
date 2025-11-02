// Stack para gerenciamento de cartões personalizados
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CardsList from '@app/screens/cards/CardsList';
import CardEditor from '@app/screens/cards/CardEditor';
import BreathEditor from '@app/screens/cards/BreathEditor';

export type CardsStackParamList = {
  CardsList: undefined;
  CardEditor: { id?: string } | undefined;
  BreathEditor: undefined;
};

const Stack = createNativeStackNavigator<CardsStackParamList>();

export function CardsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CardsList" component={CardsList} />
      <Stack.Screen name="CardEditor" component={CardEditor} />
      <Stack.Screen name="BreathEditor" component={BreathEditor} />
    </Stack.Navigator>
  );
}
