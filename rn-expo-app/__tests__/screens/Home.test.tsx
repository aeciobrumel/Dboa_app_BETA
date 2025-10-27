import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../../src/app/screens/Home';
import '../../src/app/i18n';

describe('Home', () => {
  it('shows start button', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );
    expect(getByText(/Começar agora|Empezar ahora/i)).toBeTruthy();
  });
});

