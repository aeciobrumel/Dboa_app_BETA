# Coping Cards (Expo + TypeScript)

Aplicativo React Native com Expo, focado em ajudar durante crises de ansiedade com “Cartões de Enfrentamento” (TCC coping cards). Este projeto reescreve o app original Java/Activities + XML para uma base moderna com acessibilidade, áudio guiado, i18n (pt-BR/es) e funcionamento offline.

## Objetivos principais

- Até 3 interações desde abrir o app até iniciar ajuda.
- Botões grandes, alto contraste, feedback por voz (a11y) e vibração.
- Fluxo linear guiado: Respiração → 5-4-3-2-1 → Afirmações.
- Áudio (trilha + narração) com volumes independentes e modo offline.
- Troca de idioma PT-BR/ES instantânea na Home e em Settings.

## Stack

- React Native com Expo + TypeScript strict
- Navegação: React Navigation (Tabs + Stack)
- Estado: Zustand (persistido) | Formulários: React Hook Form
- i18n: react-i18next com namespaces (app, cards, onboarding, settings)
- Áudio: expo-av | Haptics: expo-haptics | Offline: expo-asset/FileSystem
- Persistência: AsyncStorage
- Qualidade: ESLint + Prettier + Husky + lint-staged, Jest + RNTL
- CI/Build: EAS/Expo

## Árvore de pastas

```
rn-expo-app/
├─ app.json
├─ eas.json
├─ package.json
├─ tsconfig.json
├─ babel.config.js
├─ .eslintrc.js
├─ .prettierrc.json
├─ .gitignore
├─ .husky/
│  └─ pre-commit
├─ jest.setup.js
├─ __tests__/
│  ├─ components/AudioPlayer.test.tsx
│  └─ screens/Home.test.tsx
├─ assets/
│  └─ README.md
└─ src/
   ├─ App.tsx
   └─ app/
      ├─ navigation/
      │  ├─ RootNavigator.tsx
      │  └─ SessionNavigator.tsx
      ├─ screens/
      │  ├─ Home.tsx
      │  ├─ Settings.tsx
      │  ├─ Onboarding.tsx
      │  └─ session/
      │     ├─ Breath.tsx
      │     ├─ Grounding54321.tsx
      │     ├─ Affirmations.tsx
      │     └─ SessionEnd.tsx
      ├─ components/
      │  ├─ AccessibilityAnnouncer.tsx
      │  ├─ AudioPlayer.tsx
      │  ├─ BigButton.tsx
      │  ├─ LanguageToggle.tsx
      │  └─ VolumeSlider.tsx
      ├─ state/
      │  ├─ useSessionStore.ts
      │  └─ useSettingsStore.ts
      ├─ i18n/
      │  ├─ index.ts
      │  └─ locales/
      │     ├─ pt-BR/{app,cards,onboarding,settings}.json
      │     └─ es/{app,cards,onboarding,settings}.json
      ├─ theme/
      │  └─ tokens.ts
      └─ utils/
         ├─ accessibility.ts
         ├─ audio.ts
         ├─ haptics.ts
         ├─ offline.ts
         └─ storage.ts
```

## Setup

1) Criar app Expo TypeScript (ou usar esta pasta `rn-expo-app/` diretamente):

- npx create-expo-app@latest coping-cards -t expo-template-blank-typescript
- cd coping-cards

2) Instalar dependências:

- npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler
- npm i i18next react-i18next
- npm i zustand react-hook-form @react-native-async-storage/async-storage
- npm i expo-av expo-asset expo-file-system expo-haptics
- npm i -D typescript @types/react @types/react-native jest jest-expo @testing-library/react-native @testing-library/jest-native eslint prettier husky lint-staged @types/jest @babel/core

3) Scripts e hooks (já inclusos em `package.json`):

- npm run prepare (instala husky)
- Gatilho pre-commit executa lint-staged (ESLint/Prettier)

4) Rodar em dev:

- npm start
- npm run android | ios | web

## Build com EAS

- npm i -g eas-cli
- eas login
- eas build:configure
- eas build -p android --profile production
- eas build -p ios --profile production

OTA (expo-updates) já habilitado por padrão no Expo. Ajuste `app.json` conforme necessário.

## Identidade visual

- Paleta: #36507D (primária), #A6B3C8, #B4B1C6, #F8DBD8 e superfície #FEF3DD
- Tipografia: fallback de sistema (adicione Inter/Poppins depois)
- Modo claro por padrão (ver `src/App.tsx` e `tokens.ts`)

## Mapeamento da migração (Java → React Native)

Funcionalidades originais em `MyApplication/app/src/main/java/com/example/myapplication/MainActivity.java` e layouts XML foram mapeadas para:

- Seletor de idioma (bandeira/idioma):
  - Antes: toggle/flag em MainActivity
  - Agora: `src/app/components/LanguageToggle.tsx` e persistido em `useSettingsStore`. Troca instantânea via `i18n.changeLanguage`.

- Botão “Iniciar” sessão:
  - Antes: ação em MainActivity que abria Activity de sessão
  - Agora: `src/app/screens/Home.tsx` com botão grande “Começar agora” que navega para `SessionNavigator` (Stack modal).

- Media player (música de fundo e narração):
  - Antes: MediaPlayer no Android com controle manual
  - Agora: `src/app/components/AudioPlayer.tsx` com `expo-av` e dois players (trilha e narração) com volumes independentes, loop na trilha e `setAudioModeAsync` adequado.

- Bloqueio do botão “voltar” durante a sessão:
  - Antes: `onBackPressed`/flags em Activities
  - Agora: `BackHandler` + `gestureEnabled: false` nos cartões de sessão (ver `SessionNavigator` e telas em `src/app/screens/session/*`).

- Sequência de cartões (Respiração → 5-4-3-2-1 → Afirmações):
  - Antes: Activities encadeadas
  - Agora: Screens empilhadas em `SessionNavigator` com navegação linear e botão “Encerrar” sempre disponível.

## Acessibilidade aplicada

- Roles/labels e texto claro em botões (ex.: `BigButton` com `accessibilityLabel`).
- Foco previsível e fluxo linear (sem modais desnecessários). Gestos desativados durante sessão.
- Texto de alto contraste com cores da paleta (ver `tokens.ts`).
- Dynamic Type: componentes utilizam `Text` nativo; ajuste via acessibilidade do SO.
- Feedback por voz: `AccessibilityInfo.announceForAccessibility` em ações-chave (ex.: ao iniciar sessão).
- Haptics: vibração curta em toques principais (`BigButton`).

Checklist rápido:

- Botões têm `accessibilityRole` e `accessibilityLabel`.
- Evita navegação acidental (back/gestos) nas telas de sessão.
- Contraste alto por padrão (modo escuro).
- Anúncio de estado importante via announce (voz do leitor de tela).

## Offline

- Assets críticos pré-carregados em `src/App.tsx` via `ensureOfflineAssets`. 
- Incluir arquivos reais em `assets/audio/` (ver `assets/README.md`).
- `assetBundlePatterns` definido em `app.json` para empacotar assets na build.

Checklist rápido:

- Áudios essenciais referenciados via `require()` (local).
- `ensureOfflineAssets` baixa/empacota assets.
- Sem dependência de rede para iniciar o protocolo de ajuda.

## Testes

- Jest + `@testing-library/react-native` configurados.
- Exemplos: `__tests__/components/AudioPlayer.test.tsx`, `__tests__/screens/Home.test.tsx`.

## Qualidade de código

- ESLint + Prettier configurados.
- Husky + lint-staged executam lint/format em commit.

## Como iniciar a sessão em até 3 toques

- App aberto → 1) Toque em “Começar agora”. 
- (Opcional) Troca de idioma é 1 toque e é persistente; não bloqueia o fluxo.
- Fluxo sem modais/pedidos extras; sessão inicia com áudio e instruções.

## Cartões personalizados (CRUD) e TTS

- Aba “Cards” permite criar/editar/excluir cartões pessoais.
- Botão “Ouvir cartão” lê o conteúdo via TTS (nativo: expo-speech; web: SpeechSynthesis).
- Ao tocar em “Começar agora”, a sessão abre em “UserCardsSession” e já começa a ler o primeiro cartão automaticamente. Use “Próximo” para avançar e “Concluir” para terminar. Pressionar e segurar no botão de ouvir interrompe a fala.

Observação: em Web o feedback háptico não é suportado; usamos no-op para evitar erros.

## Observações sobre áudio guiado

- `AudioPlayer` cria dois `Sound`: trilha (loop, volume independente) e narração.
- Volumes ajustados em `Configurações` com `VolumeSlider`.
- `setAudioModeAsync` habilita reprodução no modo silencioso do iOS e duck no Android.

## Como rodar (resumido)

Passos rápidos:
1. Instale Node 16+ e npm ou yarn.
2. No diretório do projeto, instale dependências:
   - npm install
3. Inicie o Expo/Metro:
   - npm start
   - ou: expo start
4. Abra o app:
   - Android: npm run android
   - iOS (macOS): npm run ios
   - Dispositivo físico: escaneie o QR com Expo Go
5. Build com EAS (opcional):
   - npm i -g eas-cli
   - eas build -p android --profile production

Soluções rápidas para problemas comuns:
- Limpar cache do Metro: npm start -- --clear  (ou expo start -c)
- Reinstalar dependências: rm -rf node_modules && npm install
- Erros nativos/permissions (macOS): instale watchman: brew install watchman
- Se o Expo Go não abrir: verifique a mesma rede Wi‑Fi ou use tunnel/lan no Metro

## Notas finais

- Substitua os arquivos de áudio de exemplo por gravações licenciadas e adequadas.
- Se desejar TTS, pode-se integrar `expo-speech` (não incluso neste MVP).
- Não registrar dados sensíveis; a telemetria é apenas opt-in (placeholder no Settings).

---

Todos os arquivos foram comentados em português onde relevante. Dúvidas ou preferências (por exemplo, trocar Zustand por Redux Toolkit) — posso ajustar rapidamente.
