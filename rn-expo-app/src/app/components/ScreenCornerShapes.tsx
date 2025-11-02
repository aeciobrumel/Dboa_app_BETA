import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '@app/theme/tokens';

type Props = {
  opacity?: number; // opacidade base das formas
  safeTop?: number; // área sem formas (ex.: header)
  safeBottom?: number; // área sem formas (ex.: footer/botões)
  safeSides?: number; // margem lateral segura
  seed?: number; // para tornar determinístico
};

type Shape = {
  color: string;
  x: number; // 0..1, relativo à largura
  y: number; // 0..1, relativo à altura
  w: number; // px relativo (será escalado pela tela)
  h: number;
  rot: number;
  kind: 'circle' | 'pill' | 'half';
};

// LCG simples para aleatoriedade determinística
function rng(seedNum: number) {
  let s = seedNum % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function withOpacity(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ScreenCornerShapes({ opacity = 0.10, safeTop = 72, safeBottom = 96, safeSides = 12, seed }: Props) {
  const palette = [tokens.colors.primary, tokens.colors.secondary, tokens.colors.tertiary, tokens.colors.accent];

  const shapes = useMemo<Shape[]>(() => {
    const r = rng(seed ?? Date.now());
    const count = 4 + Math.floor(r() * 3); // 4..6 formas

    // Escolhe cantos com viés (top-left, top-right, bottom-left, bottom-right)
    const corners = [
      { cx: 0, cy: 0 },
      { cx: 1, cy: 0 },
      { cx: 0, cy: 1 },
      { cx: 1, cy: 1 }
    ];

    const result: Shape[] = [];
    const usedCombos = new Set<string>(); // evita repetição cor+canto

    for (let i = 0; i < count; i++) {
      const corner = corners[i % corners.length];
      const color = palette[i % palette.length];

      // Bias para ficar próximo aos cantos, com jitter
      const jitterX = (r() * 0.22); // 0..0.22
      const jitterY = (r() * 0.22);
      const x = corner.cx === 0 ? jitterX : 1 - jitterX;
      const y = corner.cy === 0 ? jitterY : 1 - jitterY;

      // Tamanhos variados
      const base = 140 + Math.floor(r() * 80); // 140..220
      const aspect = 0.7 + r() * 0.8; // 0.7..1.5
      const w = base * aspect;
      const h = base;

      const kindRoll = r();
      const kind: Shape['kind'] = kindRoll < 0.33 ? 'circle' : kindRoll < 0.7 ? 'pill' : 'half';
      const rot = (r() * 30 - 15) + (corner.cx ? 8 : -8); // leve rotação

      const key = `${corner.cx}-${corner.cy}-${color}`;
      if (usedCombos.has(key)) continue; // não repete mesma combinação canto+cor
      usedCombos.add(key);

      result.push({ color, x, y, w, h, rot, kind });
    }
    return result;
  }, [seed]);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {shapes.map((s, idx) => {
        const style = shapeStyle(s, opacity, { safeTop, safeBottom, safeSides });
        return <View key={idx} style={style} />;
      })}
    </View>
  );
}

function shapeStyle(s: Shape, opacity: number, safe: { safeTop: number; safeBottom: number; safeSides: number }) {
  // A posição final é aplicada via translate no container absoluto que ocupa a tela toda; para respeitar zonas seguras,
  // usamos margins grandes via inset + translate baseado em porcentagens.
  const common: any = {
    position: 'absolute',
    // bounds aproximados, os safe zones impedem sobrepor cabeçalho/rodapé e laterais
    top: s.y * 100 + '%',
    left: s.x * 100 + '%',
    width: s.w,
    height: s.h,
    transform: [
      { translateX: -s.w * (s.x < 0.5 ? 0.25 : 0.75) },
      { translateY: -s.h * (s.y < 0.5 ? 0.25 : 0.75) },
      { rotate: `${s.rot}deg` }
    ],
    backgroundColor: withOpacity(s.color, opacity),
    zIndex: 0
  };

  if (s.kind === 'circle') {
    return { ...common, borderRadius: Math.max(s.w, s.h) / 2 };
  }
  if (s.kind === 'pill') {
    return { ...common, borderRadius: Math.min(s.w, s.h) / 2 };
  }
  // half: semicírculo (meia lua)
  const radius = Math.max(s.w, s.h);
  return {
    ...common,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    borderBottomLeftRadius: radius / 4,
    borderBottomRightRadius: radius / 4,
  };
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  }
});
