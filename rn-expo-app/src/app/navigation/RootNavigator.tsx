// Navegador raiz com Tabs (Home/Settings) e Stack para sessão
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
// Navegação principal (Tabs + Stacks). Ícones do menu inferior carregados de assets/svg
import Home from '@app/screens/Home';
import Settings from '@app/screens/Settings';
import HomeIcon from '../../../assets/svg/home.svg';
import CardsIcon from '../../../assets/svg/cards.svg';
import SettingsIcon from '../../../assets/svg/settings.svg';
import Onboarding from '@app/screens/Onboarding';
import { SessionNavigator } from './SessionNavigator';
import { CardsNavigator } from './CardsNavigator';
import Legal from '@app/screens/Legal';
import CrisisMode from '@app/screens/session/CrisisMode';
import { tokens } from '@app/theme/tokens';

export type RootStackParamList = {
  Tabs: undefined;
  Onboarding: undefined;
  Session: undefined;
  Legal: undefined;
  CrisisMode: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { t } = useTranslation(['app']);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const fill = focused ? tokens.colors.primary : '#9CA3AF';
          const props = { width: size ?? 22, height: size ?? 22, fill };
          if (route.name === 'Home') return <HomeIcon {...props} />;
          if (route.name === 'Cards') return <CardsIcon {...props} />;
          if (route.name === 'Settings') return <SettingsIcon {...props} />;
          return null;
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          backgroundColor: '#FFFFFF',
        },
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: '#9CA3AF'
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ title: t('tabs.home', 'Início') }}
      />
      <Tab.Screen
        name="Cards"
        component={CardsNavigator}
        options={{ title: t('tabs.cards', 'Cartões') }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ title: t('tabs.settings', 'Configurações') }}
      />
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
      <RootStack.Screen
        name="CrisisMode"
        component={CrisisMode}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <RootStack.Screen name="Legal" component={Legal} options={{ title: 'Informações legais' }} />
    </RootStack.Navigator>
  );
}
