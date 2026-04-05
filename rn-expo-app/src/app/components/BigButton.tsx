// Botão grande com alto contraste e haptics
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { tap } from '@app/utils/haptics';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { tokens } from '@app/theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  leftIcon?: React.ReactNode;
};

export default function BigButton({
  label,
  onPress,
  variant = 'primary',
  style,
  containerStyle,
  textStyle,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
  leftIcon,
}: Props) {
  const { hapticsEnabled } = useSettingsStore();
  const handlePress = async () => {
    if (hapticsEnabled) await tap();
    onPress();
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary'
          ? styles.secondary
          : variant === 'accent'
            ? styles.accent
            : styles.primary,
        pressed && styles.pressed,
        containerStyle,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
        <Text
          style={[
            styles.text,
            variant === 'primary' ? styles.textOnPrimary : styles.textOnSecondary,
            textStyle,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: tokens.spacing(1),
  },
  primary: { backgroundColor: tokens.colors.primary },
  accent: { backgroundColor: tokens.colors.accent },
  secondary: { backgroundColor: tokens.colors.secondary },
  text: { fontSize: 18, fontFamily: 'Lemondrop-Bold' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  textOnPrimary: { color: tokens.colors.bg },
  textOnSecondary: { color: tokens.colors.text },
});
