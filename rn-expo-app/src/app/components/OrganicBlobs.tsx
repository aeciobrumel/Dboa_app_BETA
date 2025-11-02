import React, { useMemo, useRef, useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import { Animated, Easing, StyleSheet } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = {
  seed: string | number;
  count?: number; // number of blobs
  opacity?: number; // 0..1
  variance?: number; // 0..1 amount of wobble from circle
  style?: any;
  animate?: boolean;
  // Safe rectangle (central área) where blobs should NOT appear
  safeTop?: number; // px in viewBox units (default 0..200 height)
  safeBottom?: number;
  safeSides?: number; // left/right margins to keep clear
};

// RNG determinístico
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

function blobPath(cx: number, cy: number, r: number, rand: () => number, variance: number, points = 8) {
  const pts: { x: number; y: number; a: number; rad: number }[] = [];
  const step = (Math.PI * 2) / points;
  for (let i = 0; i < points; i++) {
    const a = i * step;
    const rad = r * (1 + (rand() - 0.5) * 2 * variance);
    pts.push({ a, rad, x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
  }
  const handle = (r: number) => r * 0.39; // 0.39 ~ blob-ish (menos que círculo 0.552)
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % points];
    const a0 = p0.a + Math.PI / 2;
    const a1 = p1.a - Math.PI / 2;
    const h0 = handle(p0.rad);
    const h1 = handle(p1.rad);
    const c1x = p0.x + Math.cos(a0) * h0;
    const c1y = p0.y + Math.sin(a0) * h0;
    const c2x = p1.x + Math.cos(a1) * h1;
    const c2y = p1.y + Math.sin(a1) * h1;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }
  d += ' Z';
  return d;
}

export default function OrganicBlobs({ seed, count = 5, opacity = 0.1, variance = 0.35, style, animate = true, safeTop = 80, safeBottom = 140, safeSides = 28 }: Props) {
  const s = typeof seed === 'number' ? seed : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = useMemo(() => rng(s || Date.now()), [s]);
  const palette = [tokens.colors.primary, tokens.colors.secondary, tokens.colors.tertiary, tokens.colors.accent];

  const blobs = useMemo(() => {
    const items: { path: string; color: string }[] = [];
    const W = 300, H = 200;
    const leftBound = safeSides;
    const rightBound = W - safeSides;
    const topBound = safeTop;
    const bottomBound = H - safeBottom;
    let guard = 0;
    for (let i = 0; i < count && guard < 800; i++) {
      guard++;
      // Posiciona com viés para bordas/cantos
      const edge = Math.floor(rand() * 4); // 0=L,1=R,2=T,3=B
      let cx = 0, cy = 0;
      if (edge === 0) { cx = 8 + rand() * 28; cy = 6 + rand() * (H - 12); }
      else if (edge === 1) { cx = W - (8 + rand() * 28); cy = 6 + rand() * (H - 12); }
      else if (edge === 2) { cy = 8 + rand() * 26; cx = 6 + rand() * (W - 12); }
      else { cy = H - (8 + rand() * 26); cx = 6 + rand() * (W - 12); }

      // Se está dentro do retângulo central seguro, rejeita e tenta de novo
      if (cx > leftBound && cx < rightBound && cy > topBound && cy < bottomBound) {
        i--; // tentar novamente
        continue;
      }
      // Menores por padrão
      const r0 = 14 + rand() * 28; // raio base menor
      const points = 8 + Math.floor(rand() * 4);
      const d = blobPath(cx, cy, r0 * (1.1 + rand() * 0.9), rand, variance, points);
      const color = palette[i % palette.length];
      items.push({ path: d, color });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, variance, safeTop, safeBottom, safeSides]);

  // respiração/vida: animação sutil de escala e rotação
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, animate]);

  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '4deg'] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style, { transform: [{ rotate }, { scale }] }]}>
      <Svg width="100%" height="100%" viewBox="0 0 300 200">
        {blobs.map((b, i) => (
          <Path key={i} d={b.path} fill={withOpacity(b.color, opacity)} />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 0 }
});
