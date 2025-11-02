import React, { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from '@app/state/useSettingsStore';
import { background } from '@app/assets/audio/sources';

export default function GlobalBackgroundAudio() {
  const sound = useRef(new Audio.Sound());
  const { bgVolume, duck, bgEnabled, bgMusicUri } = useSettingsStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true
        });
        const src: any = bgMusicUri ? { uri: bgMusicUri } : background;
        if (!src) return; // Web pode não ter background
        await sound.current.unloadAsync().catch(() => {});
        await sound.current.loadAsync(src);
        await sound.current.setIsLoopingAsync(true);
        await sound.current.setVolumeAsync((bgEnabled ? bgVolume : 0) * duck);
        await sound.current.playAsync();
      } catch {}
    })();
    return () => { mounted = false; sound.current.unloadAsync().catch(() => {}); };
  }, [bgMusicUri]);

  useEffect(() => {
    sound.current.setVolumeAsync((bgEnabled ? bgVolume : 0) * duck).catch(() => {});
  }, [bgVolume, duck, bgEnabled]);

  return null;
}

