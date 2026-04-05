# AGENT.md — Dboa App

Documento de contexto para agentes de desenvolvimento (Claude, Cursor, Copilot, etc.).
Leia este arquivo inteiro antes de modificar qualquer código.

---

## 1. O que é este app

**Dboa** é um app mobile de suporte emocional baseado em cartões de enfrentamento (coping cards — TCC).
Seu propósito principal é guiar qualquer pessoa durante crises de ansiedade, incluindo crises agudas
(ataque de pânico, dissociação). É um app de **autogestão 100%** — não há profissional, backend ou
autenticação envolvidos.

**Consequência direta:** toda decisão de design e desenvolvimento carrega responsabilidade clínica e
ética. O app pode estar na mão de alguém em estado de pânico severo. Isso muda as prioridades.

**Público:** misto — adultos e adolescentes, com ou sem diagnóstico psiquiátrico.
**Idiomas:** pt-BR e es (espanhol). Troca instantânea via i18n.
**Plataformas:** iOS, Android e Web (Expo).

---

## 2. Stack técnica

```
React Native + Expo (TypeScript strict)
Navegação:    React Navigation — Bottom Tabs + Native Stack
Estado:       Zustand (persistido via AsyncStorage)
Formulários:  React Hook Form
i18n:         react-i18next (namespaces: app, cards, onboarding, settings)
Áudio:        expo-av (trilha + narração com volumes independentes)
Haptics:      expo-haptics
TTS:          expo-speech (nativo) + SpeechSynthesis (web fallback)
SVG:          react-native-svg + react-native-svg-transformer
Offline:      expo-asset + expo-file-system (pré-cache de áudios)
Persistência: AsyncStorage
Qualidade:    ESLint + Prettier + Husky + lint-staged + Jest + RNTL
Build/CI:     EAS / Expo
```

Não adicionar dependências externas sem justificativa explícita em PR.
Preferir soluções nativas do Expo antes de libs de terceiros.

---

## 3. Estrutura de pastas

```
rn-expo-app/
├── src/
│   ├── App.tsx                        # Entry: tema, i18n, fontes, splash, offline
│   └── app/
│       ├── assets/
│       │   ├── audio/                 # sources.native.ts / sources.web.ts
│       │   ├── fonts/                 # Lemondrop (Regular, Bold, Italic, Bold Italic)
│       │   └── svg/                   # logo.png, home.svg, cards.svg, settings.svg
│       ├── components/
│       │   ├── AccessibilityAnnouncer.tsx
│       │   ├── AudioPlayer.tsx        # trilha + narração, volumes independentes
│       │   ├── BigButton.tsx          # botão primário/secundário do app
│       │   ├── BreathCard.tsx         # animação de respiração reutilizável
│       │   ├── GlobalBackgroundAudio.tsx
│       │   ├── LanguageToggle.tsx
│       │   ├── OrganicBlobs.tsx       # decoração SVG animada (background)
│       │   ├── OrganicShapes.tsx
│       │   ├── OrganicWaves.tsx
│       │   ├── ScreenCornerShapes.tsx # formas decorativas nos cantos
│       │   ├── SpeakButton.tsx        # botão TTS inline
│       │   └── VolumeSlider.tsx
│       ├── i18n/
│       │   └── locales/
│       │       ├── pt-BR/             # app.json, cards.json, onboarding.json, settings.json
│       │       └── es/
│       ├── navigation/
│       │   ├── RootNavigator.tsx      # Tabs (Home/Cards/Settings) + Stack (Session, Onboarding, Legal)
│       │   ├── SessionNavigator.tsx   # Stack: Breath → Grounding54321 → Affirmations → SessionEnd
│       │   └── CardsNavigator.tsx     # Stack: CardsList → CardEditor → BreathEditor
│       ├── screens/
│       │   ├── Home.tsx               # seletor de idioma + botão "Começar agora"
│       │   ├── Onboarding.tsx         # haptics opt-in + disclaimer + link legal
│       │   ├── Settings.tsx           # volumes, TTS, haptics, músicas, restaurar cards
│       │   ├── Legal.tsx
│       │   ├── cards/
│       │   │   ├── CardsList.tsx      # galeria 2 cols + modo reordenar (drag)
│       │   │   ├── CardEditor.tsx     # criar/editar card (título, corpo, imagem)
│       │   │   └── BreathEditor.tsx   # configurar ciclos de respiração
│       │   └── session/
│       │       ├── Breath.tsx         # box breathing guiado com áudio
│       │       ├── Grounding54321.tsx # técnica 5-4-3-2-1 (STUB — não implementado)
│       │       ├── Affirmations.tsx   # afirmações positivas (STUB — não implementado)
│       │       ├── UserCardsSession.tsx # sessão dinâmica com cards do usuário
│       │       └── SessionEnd.tsx     # tela de encerramento
│       ├── state/
│       │   ├── useCardsStore.ts       # CRUD de cards + favoritos + reorder + seed defaults
│       │   ├── useSessionStore.ts     # estado da sessão ativa
│       │   └── useSettingsStore.ts    # preferências persistidas
│       ├── theme/
│       │   └── tokens.ts             # cores, tipografia, spacing (ver seção 4)
│       └── utils/
│           ├── accessibility.ts
│           ├── audio.ts
│           ├── haptics.ts
│           ├── offline.ts
│           ├── speak.ts              # TTS com seleção de voz por gênero/idioma
│           └── storage.ts
```

---

## 4. Design system — tokens.ts

### Paleta atual

```ts
colors: {
  primary:    '#36507D',  // azul brand — texto principal, botões primários
  secondary:  '#A6B3C8',  // azul acinzentado — elementos secundários, bordas
  tertiary:   '#B4B1C6',  // lavanda — decoração
  accent:     '#F8DBD8',  // rosa pálido — USAR em cards favoritos, destaques quentes
  surface:    '#FEF3DD',  // creme — USAR como fundo de tiles/cards na galeria
  bg:         '#FFFFFF',  // fundo base do app
  text:       '#36507D',  // texto principal
  textMuted:  '#6B7280',  // texto secundário
}
```

**Regra:** `accent` e `surface` estão definidos mas raramente usados. Todo novo componente
que precise de uma cor de destaque quente deve usar `tokens.colors.accent`. Fundo de cards
na galeria usa `tokens.colors.surface`.

### Tipografia

Fonte primária: **Lemondrop** (Regular, Bold, Italic, Bold Italic).
Aplicada globalmente via `Text.defaultProps` em `App.tsx`.

Variantes a usar (adicionar ao tokens se não existirem):

```ts
typography: {
  sizes: {
    caption:  12,
    label:    14,
    body:     16,
    bodyLg:   18,  // texto de sessão/crise — mais legível sob estresse
    h3:       20,
    h2:       24,
    h1:       28,
  },
  lineHeight: {
    tight:  1.3,
    normal: 1.6,
    loose:  2.0,  // para textos de técnicas de respiração/grounding
  },
  weights: {
    regular: 'Lemondrop',
    bold:    'Lemondrop-Bold',
  }
}
```

### Spacing

```ts
spacing: (n: number) => 8 * n;
// Aliases semânticos a adicionar:
// sm  = spacing(1) = 8px
// md  = spacing(2) = 16px
// lg  = spacing(3) = 24px
// xl  = spacing(4) = 32px
// xxl = spacing(6) = 48px
```

Nunca use valores mágicos de spacing inline. Sempre `tokens.spacing(n)`.

### Modo de tela

O app força **light mode** (`DefaultTheme` em `App.tsx`). Não implementar dark mode
sem decisão explícita de produto.

---

## 5. Navegação

### Estrutura atual

```
RootStack
├── Tabs
│   ├── Home          (tab 1)
│   ├── Cards → CardsNavigator
│   │   ├── CardsList
│   │   ├── CardEditor
│   │   └── BreathEditor
│   └── Settings      (tab 3)
├── Onboarding        (modal)
├── Session → SessionNavigator
│   ├── Breath
│   ├── Grounding54321
│   ├── Affirmations
│   ├── UserCardsSession
│   └── SessionEnd
└── Legal
```

### Regras de navegação

- Telas de sessão bloqueiam `BackHandler` (hardware back) — o usuário não pode sair
  acidentalmente no meio de uma técnica.
- A sessão é apresentada como `fullScreenModal` para reforçar o contexto imersivo.
- `navigation as any` é um smell — sempre tipar corretamente com `RootStackParamList`.

### Adições planejadas (ver seção 8)

```
RootStack (adicionar):
├── CrisisMode        # modo crise one-tap — entrada direta, sem nav normal
└── EmergencyContacts # tela de contatos de emergência

SessionNavigator (adicionar):
├── Grounding54321    # implementar de verdade (atualmente stub)
├── TIPP              # nova técnica DBT
├── MuscleRelaxation  # relaxamento muscular progressivo
└── PhysiologicalCool # técnica de resfriamento fisiológico
```

---

## 6. Estado global (Zustand stores)

### useCardsStore

Gerencia cards personalizados do usuário.

```ts
type Card = {
  id: string;
  title: string;
  body: string;
  imageUri?: string; // mobile — caminho local
  imageBase64?: string; // web — fallback data URI
  favorite?: boolean;
  color?: string; // futuro: tema por card
  useBgMusic?: boolean;
  createdAt: number;
  updatedAt: number;
};
```

Chave AsyncStorage: `user_cards_v1`.
Seeds 5 cards padrão na primeira execução (flag `user_cards_seeded_v1`).

### useSettingsStore

```ts
{
  language: 'pt-BR' | 'es';
  bgVolume: number;          // 0..1
  narrationVolume: number;   // 0..1
  bgEnabled: boolean;
  bgMusicUri?: string;       // música personalizada
  hapticsEnabled: boolean;
  telemetryOptIn: boolean;
  autoReadCards: boolean;
  breathCycles: number;      // padrão: 4
  breathListIndex: number;   // posição do card de respiração na sessão
  ttsVoice: 'auto' | 'male' | 'female';
  ttsRate: number;           // 0.5..1.5
  ttsPitch: number;          // 0.5..1.5
  duck: number;              // volume durante narração
}
```

Chave AsyncStorage: `settings`.

### Stores a criar (seção 8)

```ts
// useCrisisPlanStore — plano de crise pessoal
// useJournalStore    — diário pós-crise simplificado
// useContactsStore   — contatos de emergência/confiança
```

---

## 7. Bugs conhecidos e dívida técnica

### Críticos — ✅ TODOS CORRIGIDOS

- ~~[BUG-01] Settings.tsx crash~~ — ✅ `useNavigation` importado e tipado
- ~~[BUG-02] BigButton contraste~~ — ✅ texto secundário usa `tokens.colors.text`
- ~~[BUG-03] Breath.tsx fundo escuro~~ — ✅ usa `tokens.colors.bg`
- ~~[BUG-04] CardEditor sem scroll~~ — ✅ `ScrollView` adicionado

### Dívida técnica

- **[DEBT-01] boxBreath() duplicado** — ⏳ PENDENTE. Extrair `useBoxBreath(cycles)` hook.
- **[DEBT-02] Grounding54321.tsx e Affirmations.tsx são stubs** — ⏳ PENDENTE. Implementar interativo.
- **[DEBT-03] JSX duplicado em CardsList.tsx** — ⏳ PENDENTE. Extrair `CardTile` e `BreathTile`.
- ~~[DEBT-04] Funções decorativas~~ — ✅ `utils/decorative.ts` criado e importado
- ~~[DEBT-05] Tokens accent/surface~~ — ✅ usados em CardsList
- ~~[DEBT-06] breathCycles ignorado~~ — ✅ lê do store

---

## 8. Roadmap de features

### Fase 0 — Segurança e acesso à crise (prioridade máxima)

Antes de qualquer feature de conteúdo, o app precisa destes itens por responsabilidade
ética/legal de atender crise aguda sem profissional.

**[F-00a] Botão de emergência persistente**

- Visível em toda tela de sessão, canto superior direito
- Um toque abre modal com: CVV (188), SAMU (192), contato de confiança cadastrado
- Nunca esconder atrás de menu ou navegação
- Componente: `EmergencyButton.tsx`
- Store: `useContactsStore` (nome, telefone, app preferido: WhatsApp/SMS)

**[F-00b] Modo crise one-tap**

- Botão grande e visível na Home, separado do fluxo normal
- Pula onboarding, menus e seleção — vai direto para o protocolo de crise
- Protocolo: Respiração simplificada (só bola + "inspira"/"expira") → Grounding → Card de âncora pessoal
- Texto aumentado (24-28px), sem blobs animados, fundo sólido calmo
- Rota: `CrisisMode` no RootStack

**[F-00c] Disclaimer robusto no Onboarding**

- Texto atual é insuficiente para o escopo (crise aguda, sem profissional)
- Adicionar: CVV 188, SAMU 192, explícito que o app não substitui intervenção em crise grave
- Exibir também na primeira abertura do Modo Crise

### Fase 1 — Completar técnicas existentes

**[F-01a] Grounding 5-4-3-2-1 interativo**
Atualmente stub. Implementar como sessão guiada passo a passo:

- 5 coisas que você VÊ (com timer entre cada item)
- 4 coisas que você TOCA
- 3 coisas que você OUVE
- 2 coisas que você CHEIRA
- 1 coisa que você SABOREIA
- Cada passo: prompt de texto grande + campo de resposta opcional + haptic + voz
- Componente base: reutilizar padrão de `Breath.tsx` (timer + feedback)

**[F-01b] Tela SessionEnd com acolhimento real**
Atual: só "Sessão concluída" + botão voltar.
Adicionar:

- Mensagem validante e calorosa (não genérica)
- Pergunta simples: "Como você está agora?" (escala visual 1-5 com emojis ou cores)
- Opção de registrar no diário (ver F-03a)
- Opção de enviar mensagem de suporte ao contato de confiança (ver F-00a)

### Fase 2 — Novas técnicas de crise aguda

Todas as técnicas abaixo são baseadas em evidências para crise aguda/pânico.
Implementar como telas dentro de `SessionNavigator` ou como cards especiais.

**[F-02a] Técnica de resfriamento fisiológico**

- Baseada no reflexo de mergulho (diving reflex): água fria no rosto desacelera o SNA
- Guia passo a passo: "vá até a pia", "molhe as mãos", "coloque no rosto por 30s"
- Timer de 30s com animação simples
- Alternativa: cubo de gelo nas mãos (para quem não tem acesso à pia)

**[F-02b] Relaxamento muscular progressivo (RMP)**

- Tensionar e soltar grupos musculares em sequência: mãos → braços → ombros → rosto → abdômen → pernas → pés
- Cada grupo: tensionar 5s (timer) → soltar → pausa 10s → próximo
- Voz guiada + haptic na mudança de grupo
- Duração total: ~8 minutos (configurável)

**[F-02c] Técnica TIPP (DBT)**

- T = Temperatura (resfriamento fisiológico — ver F-02a)
- I = Exercício Intenso (30s de qualquer movimento vigoroso)
- P = Respiração pausada (expiração 2x mais longa que inspiração)
- P = Relaxamento progressivo (ver F-02b)
- Implementar como fluxo guiado com escolha do passo inicial

**[F-02d] Respiração 4-7-8**

- Variação da box breathing, mais eficaz para ativação parassimpática rápida
- Inspirar 4s → segurar 7s → expirar 8s → repetir 4x
- Usar o mesmo componente `BreathCard` com props de fase customizáveis

**[F-02e] Modo respiração ultrassimplificado**

- Para crise aguda severa: sem texto de instrução, sem contador de ciclos
- Só a bola animada, texto mínimo "inspira" / "expira"
- Botão "Sair" sempre visível, sem "próximo" ou progresso
- O usuário sai quando quiser — não há fluxo forçado

### Fase 3 — Personalização preventiva

Features preenchidas FORA da crise, usadas DURANTE.

**[F-03a] Diário pós-crise simplificado**

- Registro automático após cada sessão
- Campos: data/hora, intensidade 1-5, técnica que mais ajudou, uma palavra livre
- Não é um diário completo — é um log de padrões
- Tela separada acessível pelo tab de Cards ou Settings
- Store: `useJournalStore`, chave AsyncStorage: `crisis_journal_v1`

**[F-03b] Plano de crise pessoal**

- Preenchido com calma, fora da crise
- Campos: "Quando começo a sentir X...", "Primeiro faço Y", "Se piorar, faço Z", "Ligo para [contato]"
- Em crise, o app abre este plano antes de qualquer técnica
- O plano escrito pela própria pessoa é clinicamente mais eficaz que instruções genéricas
- Store: `useSettingsStore` (campo `crisisPlan: string`)

**[F-03c] Âncora sensorial personalizada**

- Preenchida fora da crise: cheiro favorito, textura de objeto, música, memória
- Em crise, o app exibe como primeiro card antes das técnicas
- Campo no `useSettingsStore`: `sensoryAnchor: { smell?, texture?, memory?, musicUri? }`

**[F-03d] Gatilhos pessoais**

- Lista de situações/pensamentos/sensações que precedem crises
- Usada para personalizar ordem de técnicas mostradas
- Exemplo: usuário com gatilho social → mostrar card de "você está seguro" antes de respiração

**[F-03e] Lembretes de prática**

- Notificação suave (expo-notifications) para praticar respiração fora da crise
- Frequência configurável: diário, 3x/semana, semanal
- Técnicas praticadas em calma são 2-3x mais eficazes em crise

### Fase 4 — UX de crise (melhorias transversais)

**[F-04a] Texto aumentado automático em modo crise**

- Tamanho mínimo 24px (vs 16px normal) em telas de sessão de crise
- Menos texto por tela: máximo 2-3 linhas visíveis de uma vez
- Implementar via prop `crisisMode?: boolean` nos componentes de sessão

**[F-04b] Supressão de animações em crise aguda**

- OrganicBlobs animados podem ser perturbadores em crise severa
- Modo crise: fundo sólido, sem blobs, sem corner shapes animadas
- Só a animação de respiração permanece (é terapêutica)

**[F-04c] Progresso não-numérico em sessão de crise**

- "3/8" pode aumentar ansiedade ("ainda tenho 5 cards?")
- Em modo crise: só barra de progresso sem número, ou nenhum indicador
- Em modo normal: manter o contador atual

**[F-04d] Contato de confiança com mensagem pré-escrita**

- Usuário cadastra nome + telefone + app (WhatsApp/SMS)
- Em qualquer momento da sessão: botão "Pedir ajuda" abre deep link com mensagem pré-escrita
- Exemplo: "Estou passando por um momento difícil e preciso de companhia."
- O usuário não precisa formular nada em crise

---

## 9. Regras de desenvolvimento

### Acessibilidade (obrigatório)

- Todo componente interativo: `accessibilityRole`, `accessibilityLabel`
- Contraste mínimo WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande (≥18pt)
- Não usar cor como único indicador de estado
- TTS: todo texto de instrução deve ser lido via `expo-speech` quando `autoReadCards` ativo
- Haptics: sempre checar `hapticsEnabled` antes de acionar

### Padrões de componente

```tsx
// Botão padrão — SEMPRE usar BigButton, nunca TouchableOpacity/Pressable inline
<BigButton label="..." onPress={...} variant="primary" | "secondary" />

// Pressed state obrigatório no BigButton:
style={({ pressed }) => [styles.base, pressed && styles.pressed]}
// pressed: { opacity: 0.75 } ou { transform: [{ scale: 0.97 }] }

// Sem ScrollView → não criar tela com conteúdo variável sem ScrollView ou KeyboardAwareScrollView
```

### i18n

- Nunca usar string hardcoded em JSX — sempre `t('namespace:key', 'fallback')`
- Adicionar chave nos dois idiomas (pt-BR e es) antes de usar
- Fallback em pt-BR é aceitável temporariamente, mas registrar em comentário `// TODO: i18n es`

### Persistência

- Toda preferência nova vai em `useSettingsStore`
- Todo store novo cria sua própria chave AsyncStorage versionada (`nome_v1`)
- Nunca salvar dados sensíveis sem aviso ao usuário (alinhado com LGPD)

### Áudio

- Verificar `bgEnabled` antes de tocar trilha
- Sempre respeitar `bgVolume` e `narrationVolume` do store
- Áudios críticos (narração de respiração) devem estar em `offline.ts` para pré-cache

### Sem backend

O app não tem e não terá backend, autenticação ou sincronização em nuvem.
Toda feature deve funcionar 100% offline com AsyncStorage.
Não propor ou implementar nada que quebre esse princípio.

---

## 10. Responsabilidade clínica e legal

Este app é classificado como ferramenta de suporte emocional, não dispositivo médico.
As regras abaixo não são negociáveis:

1. **Botão de emergência** (CVV 188, SAMU 192) deve estar acessível em 1 toque em toda sessão de crise.
2. **Disclaimer** deve ser exibido no onboarding e no modo crise, explicitando os limites do app.
3. **O app nunca diagnóstica, prescreve ou substitui tratamento profissional.**
4. **Nenhuma feature pode impedir o usuário de sair do app ou ligar para emergência.**
5. Em caso de dúvida sobre uma feature ser clinicamente adequada, o padrão é a cautela.

---

## 11. O que NÃO fazer

- Não adicionar dark mode sem decisão de produto
- Não usar `navigation as any` — tipar corretamente
- Não hardcodar cores fora de `tokens.ts`
- Não criar componente de botão fora de `BigButton`
- Não duplicar lógica de animação de respiração (`useBoxBreath` hook)
- Não criar tela sem `ScrollView` se o conteúdo pode variar
- Não adicionar animações em telas de modo crise aguda
- Não usar `Pressable` diretamente onde `BigButton` já serve
- Não ignorar `hapticsEnabled` ao adicionar haptics
- Não remover o `BackHandler` das telas de sessão sem motivo muito justificado
- Não implementar nada que requeira backend, auth ou rede obrigatória

---

## 12. Plano de execução por fases (prompts para Codex)

Cada fase abaixo é independente e pode ser executada com um único prompt.
Diga "inicie fase X" para executar.

---

### FASE 1 — Refatoração técnica (DEBT-01 e DEBT-03)

**Escopo:** Limpar dívida técnica sem alterar comportamento visível.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: resolver DEBT-01 e DEBT-03.

DEBT-01 — Extrair hook useBoxBreath:
1. Criar `rn-expo-app/src/app/hooks/useBoxBreath.ts`
2. Extrair a lógica de boxBreath() que está duplicada em `Breath.tsx` (linhas ~45-82) e `BreathCard.tsx` (linhas ~25-63)
3. O hook recebe `cycles: number` e retorna { phase, cycle, isRunning, start, stop }
4. Refatorar Breath.tsx e BreathCard.tsx para usar o hook
5. Comportamento deve ser idêntico ao atual

DEBT-03 — Extrair CardTile e BreathTile:
1. Criar `rn-expo-app/src/app/components/CardTile.tsx` e `BreathTile.tsx`
2. Extrair o JSX duplicado de CardsList.tsx (modos galeria e reordenar)
3. Cada componente recebe props para ambos os modos (gallery/reorder)
4. CardsList.tsx deve importar e usar os novos componentes

Regras:
- Usar tokens.ts para cores e spacing. Nunca hardcodar.
- Manter accessibilityRole e accessibilityLabel existentes.
- Não alterar comportamento visível — só refatoração.
- Rodar `npx tsc --noEmit` ao final para verificar tipos.
```

---

### FASE 2 — Disclaimer robusto (F-00c)

**Escopo:** Atualizar Onboarding com disclaimer de segurança completo.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: implementar F-00c — Disclaimer robusto no Onboarding.

Arquivos a modificar:
- rn-expo-app/src/app/screens/Onboarding.tsx
- rn-expo-app/src/app/i18n/locales/pt-BR/onboarding.json
- rn-expo-app/src/app/i18n/locales/es/onboarding.json

O que fazer:
1. Substituir o disclaimer genérico atual por texto completo:
   - "Este app é uma ferramenta de apoio emocional. Não substitui atendimento médico ou psicológico."
   - "Em situação de emergência:" seguido de CVV 188 e SAMU 192 como links clicáveis (Linking.openURL('tel:188'))
   - "Se você ou alguém está em risco imediato, ligue agora."
2. Estilizar os números de emergência com destaque (tokens.colors.accent como fundo, texto grande 20px+)
3. Adicionar textos nos dois idiomas (pt-BR e es)
4. Manter ScrollView no Onboarding (conteúdo ficou maior)
5. Usar BigButton para qualquer botão novo
6. accessibilityRole="link" nos números de telefone

Regras:
- Nunca hardcodar cores — usar tokens.ts
- Strings em i18n, nunca inline
- Rodar `npx tsc --noEmit` ao final
```

---

### FASE 3 — Botão de emergência + store de contatos (F-00a)

**Escopo:** Criar EmergencyButton e useContactsStore.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: implementar F-00a — Botão de emergência persistente.

Arquivos a criar:
- rn-expo-app/src/app/components/EmergencyButton.tsx
- rn-expo-app/src/app/state/useContactsStore.ts

Arquivos a modificar:
- rn-expo-app/src/app/screens/session/Breath.tsx (adicionar EmergencyButton)
- rn-expo-app/src/app/screens/session/Grounding54321.tsx (adicionar EmergencyButton)
- rn-expo-app/src/app/screens/session/Affirmations.tsx (adicionar EmergencyButton)
- rn-expo-app/src/app/screens/session/UserCardsSession.tsx (adicionar EmergencyButton)
- rn-expo-app/src/app/i18n/locales/pt-BR/app.json (chaves de emergência)
- rn-expo-app/src/app/i18n/locales/es/app.json (chaves de emergência)

EmergencyButton.tsx:
1. Ícone de telefone/SOS no canto superior direito, position absolute
2. Ao tocar: abre Modal com 3 opções:
   - "CVV — 188" → Linking.openURL('tel:188')
   - "SAMU — 192" → Linking.openURL('tel:192')
   - Contato de confiança (se cadastrado) → deep link WhatsApp ou tel:
3. Botão de fechar o modal
4. Cores: fundo tokens.colors.accent, ícone tokens.colors.text
5. accessibilityRole="button", accessibilityLabel="Emergência"

useContactsStore.ts:
1. Zustand store com persist (AsyncStorage, chave: `emergency_contacts_v1`)
2. State: { contacts: Array<{ id, name, phone, app: 'whatsapp' | 'sms' }> }
3. Actions: addContact, removeContact, updateContact
4. Máximo 3 contatos

Regras:
- Usar tokens.ts para cores e spacing
- Strings em i18n
- BigButton dentro do modal
- Rodar `npx tsc --noEmit` ao final
```

---

### FASE 4 — Modo crise one-tap (F-00b)

**Escopo:** Tela CrisisMode com fluxo simplificado.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: implementar F-00b — Modo crise one-tap.

Arquivos a criar:
- rn-expo-app/src/app/screens/session/CrisisMode.tsx

Arquivos a modificar:
- rn-expo-app/src/app/navigation/RootNavigator.tsx (adicionar rota CrisisMode)
- rn-expo-app/src/app/screens/Home.tsx (adicionar botão de crise)
- rn-expo-app/src/app/i18n/locales/pt-BR/app.json
- rn-expo-app/src/app/i18n/locales/es/app.json

CrisisMode.tsx:
1. Tela fullscreen, fundo sólido tokens.colors.bg (sem OrganicBlobs, sem ScreenCornerShapes)
2. Fluxo em etapas internas (state machine simples, não múltiplas telas):
   - Etapa 1: Respiração ultrassimplificada — só bola animada + "inspira"/"expira" (texto 28px)
     Usar BreathCard com props simplificadas. Sem contador de ciclos visível.
     Botão "Próximo" e botão "Sair" sempre visíveis.
   - Etapa 2: Grounding rápido — "Olhe ao redor. Nomeie 3 coisas que você vê." (texto 24px)
     Só texto + botão próximo. Sem input.
   - Etapa 3: Mensagem de âncora — "Você está seguro. Isso vai passar." (texto 28px)
     Botão "Voltar ao início"
3. EmergencyButton visível em todas as etapas (importar da Fase 3)
4. Texto mínimo, fonte grande (24-28px), máximo 2-3 linhas por etapa
5. BackHandler bloqueado (mesmo padrão das telas de sessão)
6. Exibir disclaimer de crise na primeira abertura (mesmo texto da Fase 2)

Home.tsx:
1. Adicionar botão grande e visível ACIMA do botão "Começar agora"
2. Texto: "Preciso de ajuda agora" / "Necesito ayuda ahora"
3. Variante visual distinta: fundo tokens.colors.accent, texto tokens.colors.text
4. Navega direto para CrisisMode (sem passar por onboarding)

RootNavigator.tsx:
1. Adicionar 'CrisisMode' ao RootStackParamList
2. Adicionar Screen com presentation: 'fullScreenModal'

Regras:
- SEM animações decorativas nesta tela (só a bola de respiração)
- Texto grande, poucas palavras
- tokens.ts para tudo
- i18n para todas as strings
- Rodar `npx tsc --noEmit` ao final
```

---

### FASE 5 — Grounding 5-4-3-2-1 interativo (F-01a + DEBT-02 parcial)

**Escopo:** Implementar a técnica de grounding de verdade.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: implementar F-01a — Grounding 5-4-3-2-1 interativo, substituindo o stub atual.

Arquivos a modificar:
- rn-expo-app/src/app/screens/session/Grounding54321.tsx (reescrever)
- rn-expo-app/src/app/i18n/locales/pt-BR/app.json
- rn-expo-app/src/app/i18n/locales/es/app.json

Grounding54321.tsx — reescrever completamente:
1. Sessão guiada passo a passo com 5 etapas:
   - "5 coisas que você VÊ" → "4 coisas que você TOCA" → "3 coisas que você OUVE" → "2 coisas que você CHEIRA" → "1 coisa que você SABOREIA"
2. Cada etapa mostra:
   - Número grande animado (ex: "5") + sentido (ex: "coisas que você VÊ")
   - Texto de instrução grande (20px+) com tokens.typography
   - Timer de 15s por etapa (barra de progresso visual, sem número)
   - Botão "Próximo" para avançar manualmente antes do timer
   - Haptic feedback (checar hapticsEnabled) na transição entre etapas
3. TTS: ler a instrução de cada etapa se autoReadCards estiver ativo (usar utils/speak.ts)
4. EmergencyButton visível (importar componente)
5. BackHandler bloqueado
6. Ao completar todas as etapas: navegar para próxima tela da sessão (Affirmations)
7. ScrollView wrapping o conteúdo
8. Fundo tokens.colors.bg, texto tokens.colors.text

Regras:
- Manter a assinatura de navegação existente (SessionNavigator)
- tokens.ts para cores, spacing, tipografia
- i18n em pt-BR e es para todos os textos
- accessibilityRole e accessibilityLabel em tudo interativo
- Rodar `npx tsc --noEmit` ao final
```

---

### FASE 6 — Affirmations interativo + SessionEnd acolhedor (DEBT-02 + F-01b)

**Escopo:** Implementar Affirmations e melhorar SessionEnd.

**Prompt para Codex:**

```
Leia AGENT.md inteiro antes de começar.

Tarefa: implementar Affirmations interativo (DEBT-02) e SessionEnd acolhedor (F-01b).

Arquivos a modificar:
- rn-expo-app/src/app/screens/session/Affirmations.tsx (reescrever)
- rn-expo-app/src/app/screens/session/SessionEnd.tsx (reescrever)
- rn-expo-app/src/app/i18n/locales/pt-BR/app.json
- rn-expo-app/src/app/i18n/locales/es/app.json

Affirmations.tsx — reescrever:
1. Lista de 5-7 afirmações positivas exibidas uma por vez (carrossel simples)
2. Afirmações vindas do i18n (array), ex:
   - "Você é mais forte do que imagina"
   - "Isso vai passar"
   - "Você está seguro agora"
   - "Cada respiração te traz mais calma"
   - "Você merece cuidado e compaixão"
3. Cada afirmação: texto grande centralizado (24px), fade in suave (Animated.View opacity)
4. TTS: ler cada afirmação se autoReadCards ativo
5. Haptic leve na transição
6. Timer de 8s por afirmação OU botão "Próxima"
7. Ao final: navegar para UserCardsSession ou SessionEnd
8. EmergencyButton visível, BackHandler bloqueado

SessionEnd.tsx — reescrever:
1. Mensagem calorosa e validante (i18n):
   - "Você fez algo importante por si mesmo. Isso exige coragem."
2. Pergunta: "Como você está agora?" com 5 opções visuais (1-5):
   - Usar 5 círculos coloridos (gradiente de tokens.colors.accent a tokens.colors.primary)
   - Cada um com label: "Muito mal", "Mal", "Neutro", "Melhor", "Bem"
   - Salvar resposta em useSessionStore (adicionar campo `moodRating?: number`)
3. Botão "Voltar ao início" (BigButton primary)
4. Sem EmergencyButton aqui (sessão já encerrou)
5. ScrollView, fundo tokens.colors.bg

Regras:
- tokens.ts para tudo
- i18n pt-BR e es
- accessibilityRole e accessibilityLabel
- Rodar `npx tsc --noEmit` ao final
```

---

### Resumo das fases

| Fase | Conteúdo | Dependência |
|------|----------|-------------|
| 1 | Refatoração: useBoxBreath + CardTile/BreathTile | Nenhuma |
| 2 | Disclaimer robusto no Onboarding | Nenhuma |
| 3 | EmergencyButton + useContactsStore | Nenhuma |
| 4 | Modo crise one-tap (CrisisMode) | Fase 3 (usa EmergencyButton) |
| 5 | Grounding 5-4-3-2-1 interativo | Fase 3 (usa EmergencyButton) |
| 6 | Affirmations + SessionEnd acolhedor | Fase 3 (usa EmergencyButton) |

**Fases 1, 2 e 3 podem rodar em paralelo.**
**Fases 4, 5 e 6 dependem da Fase 3 e podem rodar em paralelo entre si.**
