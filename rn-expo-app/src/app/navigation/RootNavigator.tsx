// Navegador raiz com Tabs (Home/Settings) e Stack para sessão
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '@app/screens/Home';
import Settings from '@app/screens/Settings';
import Onboarding from '@app/screens/Onboarding';
import { SessionNavigator } from './SessionNavigator';
import { CardsNavigator } from './CardsNavigator';

export type RootStackParamList = {
  Tabs: undefined;
  Onboarding: undefined;
  Session: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="Cards" component={CardsNavigator} options={{ title: 'Cards' }} />
      <Tab.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <RootStack.Screen name="Onboarding" component={Onboarding} options={{ title: '' }} />
      <RootStack.Screen
        name="Session"
        component={SessionNavigator}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </RootStack.Navigator>
  );
}
