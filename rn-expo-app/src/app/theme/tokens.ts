// Tokens de design (cores e tipografia)
// Light mode padrão com paleta branca + azul (#36507D)
export const tokens = {
  colors: {
    // Paleta principal
    primary: '#36507D', // azul brand
    primaryDark: '#2A3F63',
    secondary: '#A6B3C8',
    tertiary: '#B4B1C6',
    accent: '#F8DBD8',
    surface: '#FEF3DD', // superfície clara opcional para cartões
    surfaceBlue: '#EBF0F8', // superfície azul clara para destaques frios

    // Base para modo claro
    bg: '#FFFFFF',
    text: '#36507D', // texto principal (cinza-azulado escuro)
    textMuted: '#6B7280', // texto secundário

    // Sessão (telas escuras)
    sessionBg: '#0F1724',
    inputBg: '#F4F6FA',
  },
  typography: {
    fontFamily: 'Lemondrop',
    sizes: {
      caption: 12,
      label: 14,
      body: 16,
      bodyLg: 18,
      h3: 20,
      h2: 24,
      h1: 28,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      loose: 2.0,
    },
    weights: {
      regular: 'Lemondrop' as const,
      bold: 'Lemondrop-Bold' as const,
    },
  },
  spacing: Object.assign(
    (n: number) => 8 * n,
    { sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
  ),
};
