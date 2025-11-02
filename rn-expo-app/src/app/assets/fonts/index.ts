// Mapeamento de fontes personalizadas para uso com expo-font
// Para ativar a sua fonte LemonDrop, coloque o arquivo em assets/fonts
// (ex.: assets/fonts/LemonDrop.ttf) e descomente a linha abaixo ajustando o caminho.

export const customFonts: Record<string, any> = {
  // Regular
  Lemondrop: require('../../../../assets/fonts/Lemondrop.ttf'),
  // Variações opcionais (se existirem)
  'Lemondrop-Bold': require('../../../../assets/fonts/Lemondrop Bold.ttf'),
  'Lemondrop-Italic': require('../../../../assets/fonts/Lemondrop Italic.ttf'),
  'Lemondrop-BoldItalic': require('../../../../assets/fonts/Lemondrop Bold Italic.ttf')
};
