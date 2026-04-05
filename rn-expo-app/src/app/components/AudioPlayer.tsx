// Player de áudio: trilha de fundo (loop) e narração com volumes independentes
import React, { useEffect, useRef } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';
import { useSettingsStore } from '@app/state/useSettingsStore';

type Props = {
  backgroundSource?: AVPlaybackSource;
  narrationSource?: AVPlaybackSource;
  loopBackground?: boolean;
  autoPlay?: boolean;
};

const LOAD_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} excedeu ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      value => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

async function safeUnload(sound: Audio.Sound) {
  try {
    await sound.unloadAsync();
  } catch {
    // Ignore unload redundante.
  }
}

export default function AudioPlayer({ backgroundSource, narrationSource, loopBackground, autoPlay }: Props) {
  const bgSound = useRef(new Audio.Sound());
  const narrationSound = useRef(new Audio.Sound());
  const runIdRef = useRef(0);
  const { bgVolume, narrationVolume } = useSettingsStore();

  useEffect(() => {
    let mounted = true;
    const runId = ++runIdRef.current;

    const isActive = () => mounted && runIdRef.current === runId;

    const prepareSound = async (
      sound: Audio.Sound,
      source: AVPlaybackSource | undefined,
      volume: number,
      shouldLoop: boolean
    ) => {
      await safeUnload(sound);
      if (!isActive() || !source) return;

      await withTimeout(sound.loadAsync(source), LOAD_TIMEOUT_MS, 'AudioPlayer.loadAsync');
      if (!isActive()) return;

      await sound.setIsLoopingAsync(shouldLoop);
      if (!isActive()) return;

      await sound.setVolumeAsync(volume);
      if (!isActive()) return;

      if (autoPlay) {
        await sound.playAsync();
      }
    };

    const setup = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true
        });
        if (!isActive()) return;

        await prepareSound(bgSound.current, backgroundSource, bgVolume, !!loopBackground);
        if (!isActive()) return;

        await prepareSound(narrationSound.current, narrationSource, narrationVolume, false);
      } catch (error) {
        if (isActive()) {
          console.warn('[AudioPlayer] Falha ao preparar áudio:', error);
        }
      }
    };

    setup();

    return () => {
      mounted = false;
      runIdRef.current += 1;
      void safeUnload(bgSound.current);
      void safeUnload(narrationSound.current);
    };
  }, [autoPlay, backgroundSource, bgVolume, loopBackground, narrationSource, narrationVolume]);

  useEffect(() => {
    bgSound.current.setVolumeAsync(bgVolume).catch(() => {});
  }, [bgVolume]);

  useEffect(() => {
    narrationSound.current.setVolumeAsync(narrationVolume).catch(() => {});
  }, [narrationVolume]);

  return null;
}
