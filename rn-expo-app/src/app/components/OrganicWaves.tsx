import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = {
  seed: string | number;
  count?: number;
  opacity?: number;
  animate?: boolean;
  style?: any;
};

type Wave = {
  color: string;
  left: string; // percent
  top: string; // percent
  w: number; // px
  h: number; // px
  br: number; // border radius
  rot: number; // deg
};

// Simple deterministic RNG
const rng = (seedNum: number) => {
  let s = seedNum % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

function withOpacity(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function OrganicWaves({ seed, count = 4, opacity = 0.1, animate = true, style }: Props) {
  const s = typeof seed === 'number' ? seed : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = useMemo(() => rng(s || Date.now()), [s]);
  const palette = [tokens.colors.primary, tokens.colors.secondary, tokens.colors.tertiary, tokens.colors.accent];

  const waves = useMemo<Wave[]>(() => {
    const arr: Wave[] = [];
    for (let i = 0; i < count; i++) {
      const aspect = 1.6 + rand() * 2.2; // bem esticadas
      const base = 120 + rand() * 160; // tamanho base
      const w = base * aspect;
      const h = base * (0.6 + rand() * 0.6);
      const br = Math.min(w, h) * (0.45 + rand() * 0.2);
      const left = `${5 + rand() * 90}%`;
      const top = `${5 + rand() * 90}%`;
      const rot = (rand() - 0.5) * 30; // -15..15
      const color = palette[i % palette.length];
      arr.push({ color, left, top, w, h, br, rot });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const anims = useRef(waves.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!animate) return;
    const loops = anims.map((val, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: 2200 + idx * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 2200 + idx * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop && l.stop());
  }, [anims, animate]);

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      {waves.map((w, i) => {
        const t = anims[i] || new Animated.Value(0);
        const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, (i % 2 ? 6 : -6)] });
        const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, (i % 2 ? -4 : 4)] });
        const rotate = t.interpolate({ inputRange: [0, 1], outputRange: [`${w.rot}deg`, `${w.rot + (i % 2 ? 6 : -6)}deg`] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: w.left,
              top: w.top,
              width: w.w,
              height: w.h,
              backgroundColor: withOpacity(w.color, opacity),
              borderRadius: w.br,
              transform: [
                { translateX },
                { translateY },
                { rotate }
              ],
              zIndex: 0
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, zIndex: 0 }
});

