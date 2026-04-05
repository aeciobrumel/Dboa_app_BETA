export type CardCategory =
  | 'crise'
  | 'respiracao'
  | 'aterramento'
  | 'autocompaixao'
  | 'realidade'
  | 'pos-crise';

const OPENING_BY_CATEGORY: Partial<Record<CardCategory, string>> = {
  crise: 'Estou aqui com você.',
  respiracao: 'Vamos respirar juntos.',
  aterramento: 'Vamos ancorar juntos.',
  autocompaixao: 'Você merece gentileza.'
};

export function narrateText(text: string, category?: CardCategory): string {
  const opening = OPENING_BY_CATEGORY[category ?? 'realidade'] ?? 'Um momento só seu.';
  const normalizedText = text
    .replace(/acalme-se/gi, 'respira comigo')
    .replace(/você precisa/gi, 'você pode');
  const sentences = normalizedText
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return opening;
  }

  return `${opening}... ${sentences.join('...')}`;
}
