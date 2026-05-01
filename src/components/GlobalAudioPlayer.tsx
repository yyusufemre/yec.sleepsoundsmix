import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import useMixerStore from '../store/useMixerStore';
import NativeSoundManager from '../services/NativeSoundManager';
import { MOCK_SOUNDS } from '../data/mockSounds';
import TrackPlayer, { State, RepeatMode } from 'react-native-track-player';
import { setupTrackPlayer } from '../services/TrackPlayerSetup';

const GlobalAudioPlayer = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const isPausedBySystem = useMixerStore(state => state.isPausedBySystem);

  const activeSoundItems = React.useMemo(() => 
    MOCK_SOUNDS.filter(s => activeSounds && activeSounds[s.id] !== undefined),
    [activeSounds]
  );
  const activeTitle = React.useMemo(() => 
    activeSoundItems.map(s => s.title).join(', '),
    [activeSoundItems]
  );

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
            // No active sounds: completely reset to destroy the notification card
            await TrackPlayer.reset();
          } catch {
            // Silent catch
          }
        }
      } catch (error) {
        console.warn('TrackPlayer sync error:', error);
      }
    };

    syncTrackPlayer();
  }, [activeTitle, isPausedBySystem]);

  const prevSoundIdsRef = React.useRef<Set<string>>(new Set());
  const activeSoundIds = React.useMemo(() => 
    Object.keys(activeSounds).sort().join(','), 
    [activeSounds]
  );

  useEffect(() => {
    const currentIds = new Set(activeSoundItems.map(s => s.id));

    // Stop sounds that were removed from the mix
    prevSoundIdsRef.current.forEach(id => {
      if (!currentIds.has(id)) {
        NativeSoundManager.stop(id);
      }
    });

    // Tüm sesleri Native katmanda yönetiyoruz.
    if (isPausedBySystem || activeSoundItems.length === 0) {
      NativeSoundManager.pauseAll();
    } else {
      activeSoundItems.forEach(sound => {
        // Safe volume calculation to avoid NaN
        const volumeVal = activeSounds[sound.id];
        const volume = (typeof volumeVal === 'number' ? volumeVal : 50) / 100;
        
        NativeSoundManager.play(sound.id, sound.url, volume);
        NativeSoundManager.setVolume(sound.id, volume);
      });
    }
    prevSoundIdsRef.current = currentIds;
  }, [activeSoundIds, activeSounds, isPausedBySystem, activeSoundItems]);

  if (activeSoundItems.length === 0) return null;

  return <View style={styles.hidden} />;
};

const styles = StyleSheet.create({
  hidden: { width: 0, height: 0, opacity: 0 },
});

export default GlobalAudioPlayer;
