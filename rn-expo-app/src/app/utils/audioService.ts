import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ExpoSpeech from 'expo-speech';
import { useCardsStore, type Card } from '@app/state/useCardsStore';

let currentSound: Audio.Sound | null = null;

async function prepareAudioMode() {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true
  });
}

async function fileExists(uri: string) {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch (error) {
    console.warn('[audioService] Falha ao verificar arquivo de audio:', error);
    return false;
  }
}

async function playFile(uri: string) {
  await stop();
  await prepareAudioMode();

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true }
  );

  currentSound = sound;
  sound.setOnPlaybackStatusUpdate(status => {
    if (!status.isLoaded || !status.didJustFinish) return;

    if (currentSound === sound) {
      currentSound = null;
    }

    sound.unloadAsync().catch(() => {});
  });
}

async function speakText(text: string) {
  await stop();
  ExpoSpeech.speak(text);
}

export async function play(card: Card): Promise<void> {
  const text = card.narratedText ?? card.body;
  const needsRegeneration =
    typeof card.audioGeneratedAt === 'number' &&
    typeof card.updatedAt === 'number' &&
    card.updatedAt > card.audioGeneratedAt;

  if (needsRegeneration) {
    const generatedPath = await generate(card);
    if (generatedPath && await fileExists(generatedPath)) {
      await playFile(generatedPath);
    }
    return;
  }

  if (card.audioPath) {
    if (await fileExists(card.audioPath)) {
      await playFile(card.audioPath);
      return;
    }

    const generatedPath = await generate(card);
    if (generatedPath && await fileExists(generatedPath)) {
      await playFile(generatedPath);
    }
    return;
  }

  await speakText(text);
}

export async function generate(card: Card): Promise<string | null> {
  const text = card.narratedText ?? card.body;
  const generatedAt = Date.now();

  // TODO: replace with Piper local TTS when native module is ready
  await speakText(text);
  await useCardsStore.getState().updateCard(card.id, {
    audioGeneratedAt: generatedAt,
    updatedAt: card.updatedAt
  });

  return null;
}

export async function stop(): Promise<void> {
  try {
    ExpoSpeech.stop();
  } catch (error) {
    console.warn('[audioService] Falha ao parar fala:', error);
  }

  if (!currentSound) return;

  const sound = currentSound;
  currentSound = null;

  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync();
    }
  } catch (error) {
    console.warn('[audioService] Falha ao parar audio:', error);
  }
}
