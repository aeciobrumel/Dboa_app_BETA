// Mapeamento de fontes personalizadas para uso com expo-font
// Para ativar a sua fonte LemonDrop, coloque o arquivo em assets/fonts
// (ex.: assets/fonts/LemonDrop.ttf) e descomente a linha abaixo ajustando o caminho.

export const customFonts: Record<string, any> = {
  // Regular (arquivos estão na MESMA pasta deste index.ts)
  Lemondrop: require('./Lemondrop.ttf'),
  // Variações opcionais (se existirem)
  'Lemondrop-Bold': require('./Lemondrop Bold.ttf'),
  'Lemondrop-Italic': require('./Lemondrop Italic.ttf'),
  'Lemondrop-BoldItalic': require('./Lemondrop Bold Italic.ttf')
};
