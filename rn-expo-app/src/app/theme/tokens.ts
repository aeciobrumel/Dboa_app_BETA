// Tokens de design (cores e tipografia)
// Light mode padrão com paleta branca + azul (#36507D)
export const tokens = {
  colors: {
    // Paleta principal
    primary: '#36507D', // azul brand
    secondary: '#A6B3C8',
    tertiary: '#B4B1C6',
    accent: '#F8DBD8',
    surface: '#FEF3DD', // superfície clara opcional para cartões

    // Base para modo claro
    bg: '#FFFFFF',
    text: '#36507D', // texto principal (cinza-azulado escuro)
    textMuted: '#6B7280' // texto secundário
  },
  typography: {
    fontFamily: 'System' // fallback até Inter/Poppins serem adicionadas
  },
  spacing: (n: number) => 8 * n
};
