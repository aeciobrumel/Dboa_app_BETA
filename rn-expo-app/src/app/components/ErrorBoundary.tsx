import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Pressable style={styles.button} onPress={this.handleReset} accessibilityRole="button">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: tokens.colors.text, fontSize: 22, fontFamily: 'Lemondrop-Bold', marginBottom: 12 },
  message: { color: tokens.colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: tokens.colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: tokens.colors.primary, fontWeight: '600' },
});
