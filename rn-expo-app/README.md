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
- TTS: expo-speech (nativo) + SpeechSynthesis (web)
- SVG: react-native-svg + react-native-svg-transformer
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

1. Criar app Expo TypeScript (ou usar esta pasta `rn-expo-app/` diretamente):

- npx create-expo-app@latest coping-cards -t expo-template-blank-typescript
- cd coping-cards

2. Instalar dependências:

- npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler
- npm i i18next react-i18next
- npm i zustand react-hook-form @react-native-async-storage/async-storage
- npm i expo-av expo-asset expo-file-system expo-haptics
- npm i -D typescript @types/react @types/react-native jest jest-expo @testing-library/react-native @testing-library/jest-native eslint prettier husky lint-staged @types/jest @babel/core

3. Scripts e hooks (já inclusos em `package.json`):

- npm run prepare (instala husky)
- Gatilho pre-commit executa lint-staged (ESLint/Prettier)

4. Rodar em dev:

- npm start
- npm run android | ios | web

5. Sincronizar dependências com a versão do Expo (recomendado quando aparecer aviso no terminal):

- npx expo install

Se o terminal listar versões “expected”, use exatamente as sugeridas (ex.: `npx expo install react-native-screens@3.31.1`).

## Build com EAS

- npm i -g eas-cli
- eas login
- eas build:configure
- eas build -p android --profile production
- eas build -p ios --profile production

OTA (expo-updates) já habilitado por padrão no Expo. Ajuste `app.json` conforme necessário.

## Build e Publicação (Android/iOS)

Pré‑requisitos
- Conta Expo: `npx eas login`
- Projeto instala e roda: `npm install` e `npx expo install`
- iOS (para publicar): conta Apple Developer e Bundle ID

Identificadores (obrigatório para lojas)
- Edite `app.json` e configure:
  - Android: `android.package` (ex.: `com.suaempresa.copingcards`)
  - iOS: `ios.bundleIdentifier` (ex.: `com.suaempresa.copingcards`)

Sincronizar versões com o Expo
- Sempre que o terminal avisar “expected version…”, rode `npx expo install` ou use as versões sugeridas.

Android
- APK (instalar direto/teste interno):
  - `npx eas build -p android --profile preview`
  - Baixar o último build: `npx eas build:download --latest -p android`
- AAB (Play Store):
  - `npx eas build -p android --profile production`
- Keystore: `npx eas credentials -p android` (faça backup)

iOS
- IPA (TestFlight/App Store):
  - `npx eas build -p ios --profile preview` (teste) ou `--profile production` (loja)
  - Baixar o último build: `npx eas build:download --latest -p ios`

Envio às lojas
- Play Store: `npx eas submit -p android --latest`
- App Store: `npx eas submit -p ios --latest`

Scripts prontos (package.json)
- Android
  - `npm run build:android:preview` → APK
  - `npm run build:android` → AAB (loja)
- iOS
  - `npm run build:ios:preview` → TestFlight
  - `npm run build:ios` → App Store
- Web
  - `npm run build:web`

Dicas
- Limpar cache: `npx expo start -c`
- Listar builds: `npx eas build:list`
- Rodar sem prompts (CI): adicionar `--non-interactive` aos comandos EAS

## Identidade visual

- Paleta: #36507D (primária), #A6B3C8, #B4B1C6, #F8DBD8 e superfície #FEF3DD
- Tipografia (Lemondrop):
  - Coloque os arquivos em `src/app/assets/fonts/` com estes nomes: `Lemondrop.ttf`, `Lemondrop Bold.ttf`, `Lemondrop Italic.ttf`, `Lemondrop Bold Italic.ttf`.
  - O carregamento está em `src/App.tsx` e o mapeamento em `src/app/assets/fonts/index.ts`.
  - O app aplica Lemondrop globalmente; para negrito usamos `fontFamily: 'Lemondrop-Bold'` (evita fallback do SO).
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
- Fluxo sem modais/pedidos extras; a sessão inicia com o exercício de respiração guiada e áudio.

## Cartões personalizados (CRUD) e TTS

- Aba “Cards” permite criar/editar/excluir cartões pessoais.
- Aba “Cards” inclui também o card "Respiração guiada" (editável: ciclos).
- Botão “Ouvir cartão” lê apenas o conteúdo do cartão (sem o título) via TTS (nativo: expo-speech; web: SpeechSynthesis).
- Ao tocar em “Começar agora”, a sessão abre diretamente na lista de cartões, onde o primeiro card é um exercício de Respiração guiada. Após esse card, vêm os seus cartões personalizados. Por padrão, os cartões não são lidos automaticamente; a leitura ocorre somente ao tocar em “Ouvir cartão”. É possível reativar a leitura automática em Configurações → “Leitura automática dos cartões”. Use “Próximo” para avançar e “Concluir” para terminar. Pressionar e segurar no botão de ouvir interrompe a fala.

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

- Limpar cache do Metro: npm start -- --clear (ou expo start -c)
- Reinstalar dependências: rm -rf node_modules && npm install
- Erros nativos/permissions (macOS): instale watchman: brew install watchman
- Se o Expo Go não abrir: verifique a mesma rede Wi‑Fi ou use tunnel/lan no Metro

## Notas finais

- Substitua os arquivos de áudio de exemplo por gravações licenciadas e adequadas.
- Se desejar TTS, pode-se integrar `expo-speech` (não incluso neste MVP).
- Não registrar dados sensíveis; a telemetria é apenas opt-in (placeholder no Settings).

---

Todos os arquivos foram comentados em português onde relevante. Dúvidas ou preferências (por exemplo, trocar Zustand por Redux Toolkit) — posso ajustar rapidamente.
## Música de fundo (loop)

- Padrão do app: arquivo local `assets/audio/background.mp3`.
  - Onde trocar no código: `src/app/assets/audio/sources.native.ts` (const `background`).
  - Substitua o arquivo e rode `npx expo start -c`.
- Player global: `src/app/components/GlobalBackgroundAudio.tsx` (loop + volume + ducking).
- Ducking automático: quando a narração/TTS fala, reduz temporariamente o volume (`src/app/utils/speak.ts`).
- Música personalizada: Configurações → "Escolher música de fundo" (usa `expo-document-picker`). Voltar ao padrão: "Usar música padrão".
## Ícones do menu inferior (SVG)

- Coloque seus ícones em `assets/svg/` com estes nomes:
  - `home.svg`, `cards.svg`, `settings.svg`
- Já configuramos o suporte a SVG com `react-native-svg` e `react-native-svg-transformer`.
- Arquivos adicionados:
  - `metro.config.js` (transformer)
  - `declarations.d.ts` (tipos TypeScript)
  - Ícones de exemplo (pode substituir à vontade): `assets/svg/{home,cards,settings}.svg`
- Uso no código: o Tab Navigator importa esses SVGs e renderiza como ícones
  - Veja `src/app/navigation/RootNavigator.tsx`.

## Voz da narração (TTS)

- Configurações → Voz da narração: escolha Auto/Feminina/Masculina, Velocidade e Tom.
- Botão "Pré‑visualizar voz" reproduz uma amostra. Se a voz escolhida não existir no dispositivo, o app avisa por voz e usa a alternativa disponível.
- Implementação: `src/app/utils/speak.ts` (web + nativo), ajustes em `src/app/state/useSettingsStore.ts` e tela `src/app/screens/Settings.tsx`.

## Cartões: galeria e reordenar

- Galeria: 2 colunas com tamanho fixo (cartas), sombra e preview de título + conteúdo.
- Reordenar: segure o handle "≡" para arrastar. A ordem é persistida. O card "Respiração guiada" também pode ser reposicionado.
- Implementação: `src/app/screens/cards/CardsList.tsx`.

## Sessão em looping

- A sessão percorre os cartões em loop e só termina quando você tocar em "Encerrar".
- Implementação: `src/app/screens/session/UserCardsSession.tsx`.

## Formas orgânicas (decorativas)

- Fundo de tela com blobs orgânicos nas bordas, mudando a cada avanço.
- Arquivos: `src/app/components/OrganicBlobs.tsx` e `ScreenCornerShapes.tsx`.
