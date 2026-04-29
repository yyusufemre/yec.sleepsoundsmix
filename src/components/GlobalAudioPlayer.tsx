import React, { useEffect } from 'react';
import { View } from 'react-native';
import useMixerStore from '../store/useMixerStore';
import NativeSoundManager from '../services/NativeSoundManager';
import { MOCK_SOUNDS } from '../data/mockSounds';
import TrackPlayer, { State, RepeatMode } from 'react-native-track-player';
import { setupTrackPlayer } from '../services/TrackPlayerSetup';

const GlobalAudioPlayer = () => {
  const activeSounds = useMixerStore(state => state.activeSounds);
  const isPausedBySystem = useMixerStore(state => state.isPausedBySystem);

  const activeSoundItems = MOCK_SOUNDS.filter(s => activeSounds[s.id] !== undefined);
  const activeTitle = activeSoundItems.map(s => s.title).join(', ');

  useEffect(() => {
    const syncTrackPlayer = async () => {
      try {
        await setupTrackPlayer(); // Wait for an idempotent, single-instance setup

        if (activeTitle) {
          const currentState = await TrackPlayer.getState();
          const stateVal = (currentState as any).state || currentState;
          const isDead = stateVal === State.None || stateVal === State.Ended || stateVal === 'none' || stateVal === 'stopped';

          if (isDead) {
            // Tamamen sıfırla ve yeniden ayağa kaldır (Zombi state'i kırar)
            await TrackPlayer.reset();
            await TrackPlayer.add([
              {
                id: 'dummy',
                url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/ambiyans-music.m4a',
                title: 'Uyku Sesleri',
                artist: activeTitle,
                artwork: 'https://cdn-icons-png.flaticon.com/512/3039/3039401.png',
              },
            ]);
            await TrackPlayer.setRepeatMode(RepeatMode.Track);
            await TrackPlayer.setVolume(0); // Make sure it is silent
          } else {
            // Hala ayaktaysa sadece güncel metadata'yı bas
            await TrackPlayer.updateNowPlayingMetadata({
              title: 'Uyku Sesleri',
              artist: activeTitle,
            });
          }
          
          if (!isPausedBySystem) {
            await TrackPlayer.play();
          } else {
            await TrackPlayer.pause();
          }
        } else {
          try {
            await TrackPlayer.stop(); // Ses yoksa bildirimi tamamen yokediyoruz
          } catch (e) {
            // Sessizce geç. RemoteStop zaten reset atmış olabilir.
          }
        }
      } catch (error) {
        console.warn('TrackPlayer sync error:', error);
      }
    };

    syncTrackPlayer();
  }, [activeTitle, isPausedBySystem]);

  // SPIKE TEST: NativeSoundManager ile 2 sesi yönet
  useEffect(() => {
    // Tüm sesleri Native katmanda yönetiyoruz.
    if (isPausedBySystem || activeSoundItems.length === 0) {
      NativeSoundManager.pauseAll();
    } else {
      activeSoundItems.forEach(sound => {
        const volume = activeSounds[sound.id] / 100;
        NativeSoundManager.play(sound.id, sound.url, volume);
        NativeSoundManager.setVolume(sound.id, volume);
      });
    }
  }, [activeSoundItems, activeSounds, isPausedBySystem]);

  if (activeSoundItems.length === 0) return null;

  return (
    <View style={{ width: 0, height: 0, opacity: 0 }}>
      {/* 
        SPIKE sırasında react-native-video bileşenlerini GİZLİYORUZ (render etmiyoruz). 
        Eğer test başarılı olursa bu bloğu tamamen sileceğiz.
      */}
    </View>
  );
};

export default GlobalAudioPlayer;
