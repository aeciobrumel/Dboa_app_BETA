import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = {
  seed?: string | number;
  count?: number; // number of shapes
  opacity?: number; // base opacity per shape
  style?: any;
};

// Simple seeded RNG (LCG)
const rng = (seedNum: number) => {
  let s = seedNum % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function OrganicShapes({ seed = 1, count = 3, opacity = 0.12, style }: Props) {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width && height && (width !== dims.w || height !== dims.h)) setDims({ w: width, h: height });
  };

  const shapes = useMemo(() => {
    const s = typeof seed === 'number' ? seed : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = rng(s || 1);
    const palette = [tokens.colors.primary, tokens.colors.secondary, tokens.colors.tertiary, tokens.colors.accent];
    return new Array(count).fill(0).map((_, i) => {
      const color = palette[i % palette.length];
      return {
        color: hexToRgba(color, opacity * (0.9 + rand() * 0.4)),
        // Sizes are 40%..85% of the smallest dimension
        size: 0.4 + rand() * 0.45,
        x: rand(),
        y: rand(),
        rot: rand() * 360
      };
    });
  }, [seed, count, opacity]);

  return (
    <View pointerEvents="none" style={[styles.container, style]} onLayout={onLayout}>
      {dims.w > 0 &&
        shapes.map((sh, idx) => {
          const base = Math.min(dims.w, dims.h);
          const w = base * sh.size * (1.2 - (idx % 2) * 0.2);
          const h = base * sh.size * (0.9 + (idx % 3) * 0.15);
          const left = Math.max(-w * 0.25, Math.min(dims.w - w * 0.75, sh.x * dims.w - w / 2));
          const top = Math.max(-h * 0.25, Math.min(dims.h - h * 0.75, sh.y * dims.h - h / 2));
          return (
            <View
              key={idx}
              style={{
                position: 'absolute',
                left,
                top,
                width: w,
                height: h,
                backgroundColor: sh.color,
                borderRadius: Math.max(w, h) / 2,
                transform: [{ rotate: `${sh.rot}deg` }]
              }}
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  }
});

