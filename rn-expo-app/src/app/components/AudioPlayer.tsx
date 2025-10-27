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

export default function AudioPlayer({ backgroundSource, narrationSource, loopBackground, autoPlay }: Props) {
  const bgSound = useRef(new Audio.Sound());
  const narrationSound = useRef(new Audio.Sound());
  const { bgVolume, narrationVolume } = useSettingsStore();

  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true
      });
      if (backgroundSource) {
        await bgSound.current.loadAsync(backgroundSource);
        await bgSound.current.setIsLoopingAsync(!!loopBackground);
        await bgSound.current.setVolumeAsync(bgVolume);
        if (autoPlay) await bgSound.current.playAsync();
      }
      if (narrationSource) {
        await narrationSound.current.loadAsync(narrationSource);
        await narrationSound.current.setVolumeAsync(narrationVolume);
        if (autoPlay) await narrationSound.current.playAsync();
      }
    };
    setup();
    return () => {
      mounted = false;
      bgSound.current.unloadAsync();
      narrationSound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    bgSound.current.setVolumeAsync(bgVolume).catch(() => {});
  }, [bgVolume]);

  useEffect(() => {
    narrationSound.current.setVolumeAsync(narrationVolume).catch(() => {});
  }, [narrationVolume]);

  return null;
}

