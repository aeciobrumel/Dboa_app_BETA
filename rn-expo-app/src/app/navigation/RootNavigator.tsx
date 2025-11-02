// Navegador raiz com Tabs (Home/Settings) e Stack para sessão
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '@app/screens/Home';
import Settings from '@app/screens/Settings';
import HomeIcon from '../../../assets/svg/home.svg';
import CardsIcon from '../../../assets/svg/cards.svg';
import SettingsIcon from '../../../assets/svg/settings.svg';
import { tokens } from '@app/theme/tokens';
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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size, color }) => {
          const fill = focused ? tokens.colors.primary : tokens.colors.secondary;
          const props = { width: size ?? 22, height: size ?? 22, fill } as any;
          if (route.name === 'Home') return <HomeIcon {...props} />;
          if (route.name === 'Cards') return <CardsIcon {...props} />;
          if (route.name === 'Settings') return <SettingsIcon {...props} />;
          return null;
        },
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: tokens.colors.secondary
      })}
    >
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
