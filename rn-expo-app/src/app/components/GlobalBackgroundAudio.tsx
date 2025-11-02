// Áudio de fundo global (loop):
// - Toca a música padrão (assets/audio/background.mp3) ou uma música personalizada do usuário
// - Respeita o volume definido nas Configurações
// - Faz "ducking" automático quando a narração/voz está ativa (reduz o volume temporariamente)
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
        // Escolhe a fonte: URI do usuário (quando houver) ou o arquivo padrão empacotado
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

  // Atualiza volume ao mudar preferências (inclui o fator de ducking)
  useEffect(() => {
    sound.current.setVolumeAsync((bgEnabled ? bgVolume : 0) * duck).catch(() => {});
  }, [bgVolume, duck, bgEnabled]);

  return null;
}
