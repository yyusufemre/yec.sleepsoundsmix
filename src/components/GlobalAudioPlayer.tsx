import React, { useEffect } from 'react';
import useMixerStore from '../store/useMixerStore';
import NativeSoundManager from '../services/NativeSoundManager';
import MetronomeService from '../services/MetronomeService';
import TrackPlayer, { State, RepeatMode } from 'react-native-track-player';
import { isTrackPlayerSetupComplete, setupTrackPlayer } from '../services/TrackPlayerSetup';
import { useTranslation } from 'react-i18next';
import { getLocalizedSoundTitle } from '../utils/soundUtils';

type SoundItem = {
  id: string;
  title: string;
  url: string;
};

type ActiveSounds = Record<string, number>;

const GlobalAudioPlayer = () => {
  const { t, i18n } = useTranslation();
  const activeSoundsRaw = useMixerStore((state: any) => state.activeSounds);
  const isPausedBySystem = useMixerStore((state: any) => state.isPausedBySystem);
  const sounds = (useMixerStore((state: any) => state.sounds) || []) as SoundItem[];
  const fetchSounds = useMixerStore((state: any) => state.fetchSounds);
  const metronomBpm = useMixerStore((state: any) => state.metronomBpm) as number;

  useEffect(() => {
    fetchSounds();
  }, [fetchSounds]);
  // Stabilize object ref — prevents hook deps from firing on every render
  const activeSounds = React.useMemo(
    () => (activeSoundsRaw || {}) as ActiveSounds,
    [activeSoundsRaw]
  );

  // 1. Determine active sound IDs for lifecycle (play/stop)
  const activeSoundIds = React.useMemo(() =>
    Object.keys(activeSounds).sort().join(','),
    [activeSounds]
  );

  const activeSoundItems = React.useMemo(() =>
    (sounds || []).filter((s: SoundItem) => activeSounds[s.id] !== undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSoundIds, sounds] // Only re-run when IDs change, not volumes
  );

  const activeTitle = React.useMemo(() =>
    activeSoundItems.map((s: SoundItem) => getLocalizedSoundTitle(s, i18n.language, t)).join(', '),
    [activeSoundItems, t, i18n.language]
  );

  // TrackPlayer (Notification) Sync - Triggered by ID changes or Pause status
  useEffect(() => {
    const syncTrackPlayer = async () => {
      try {
        if (!activeTitle) {
          if (isTrackPlayerSetupComplete()) {
            await TrackPlayer.reset();
          }
          return;
        }

        await setupTrackPlayer();

        const currentState = await TrackPlayer.getPlaybackState();
        const stateVal = (currentState as any).state || currentState;
        const isDead = stateVal === State.None || stateVal === State.Ended || stateVal === 'none' || stateVal === 'stopped';

        if (isDead) {
          await TrackPlayer.reset();
          await TrackPlayer.add([
            {
              id: 'dummy',
              url: require('../../assets/sounds/ambiyans-music.m4a'),
              title: t('common.app_name'),
              isLiveStream: true,
              artwork: 'https://cdn-icons-png.flaticon.com/512/3039/3039401.png',
            },
          ]);
          await TrackPlayer.setRepeatMode(RepeatMode.Track);
          await TrackPlayer.setVolume(0);
        } else {
          await TrackPlayer.updateNowPlayingMetadata({
            title: t('common.app_name'),
            artist: undefined,
          });
        }

        if (!isPausedBySystem) {
          await TrackPlayer.play();
        } else {
          await TrackPlayer.pause();
        }
      } catch (error) {
        console.warn('TrackPlayer sync error:', error);
      }
    };

    syncTrackPlayer();
  }, [activeTitle, isPausedBySystem, t]);

  const prevSoundIdsRef = React.useRef<Set<string>>(new Set());

  // Native Sound Management - Lifecycle and Initial Volume
  useEffect(() => {
    const currentIds = new Set(activeSoundIds.split(',').filter(Boolean));

    // Stop sounds that were removed
    prevSoundIdsRef.current.forEach(id => {
      if (!currentIds.has(id)) {
        NativeSoundManager.stop(id);
      }
    });

    if (isPausedBySystem || currentIds.size === 0) {
      NativeSoundManager.pauseAll();
    } else {
      activeSoundItems.forEach((sound: SoundItem) => {
        if (!sound || !sound.id || !sound.url) return;

        // Final access verification security gate
        if (!useMixerStore.getState().isSoundAccessible(sound.id)) {
          console.warn(`[GlobalAudioPlayer] Sound ${sound.id} is locked and not accessible. Skipping native play.`);
          return;
        }

        const volumeVal = activeSounds[sound.id];
        const volume = (typeof volumeVal === 'number' ? volumeVal : 50) / 100;

        // play() is idempotent in NativeSoundManager, won't restart if already playing
        NativeSoundManager.play(sound.id, sound.url, volume);
      });
    }
    prevSoundIdsRef.current = currentIds;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSoundIds, activeSoundItems, isPausedBySystem]); // NOT depending on activeSounds object

  // Individual Volume Sync - Only triggers when volumes change
  // We use a ref to track volumes to avoid bridge flooding for ALL sounds
  const lastVolumesRef = React.useRef<Record<string, number>>({});

  useEffect(() => {
    if (isPausedBySystem) return;

    Object.keys(activeSounds).forEach(id => {
      const vol = activeSounds[id];
      if (lastVolumesRef.current[id] !== vol) {
        const nativeVol = (typeof vol === 'number' ? vol : 50) / 100;
        NativeSoundManager.setVolume(id, nativeVol);
        lastVolumesRef.current[id] = vol;
      }
    });
  }, [activeSounds, isPausedBySystem]);

  // Periodically check and clean up expired sounds
  useEffect(() => {
    const checkExpired = () => {
      const storeState = useMixerStore.getState() as any;
      if (storeState && typeof storeState.checkExpiredAccess === 'function') {
        storeState.checkExpiredAccess();
      }
    };

    const interval = setInterval(checkExpired, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Metronome Lifecycle ────────────────────────────────────────────────
  // Determine if metronome is active and its current volume
  const isMetronomeActive = activeSounds['nefes-ritmi'] !== undefined;
  const metronomeVolume = isMetronomeActive
    ? (activeSounds['nefes-ritmi'] ?? 50) / 100
    : 0;

  useEffect(() => {
    if (isMetronomeActive && !isPausedBySystem) {
      MetronomeService.start(metronomBpm, metronomeVolume);
    } else {
      MetronomeService.stop();
    }
    // Cleanup on unmount
    return () => MetronomeService.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMetronomeActive, isPausedBySystem]);

  // Update BPM in real-time without restarting the audio session
  useEffect(() => {
    if (MetronomeService.isRunning()) {
      MetronomeService.setBpm(metronomBpm);
    }
  }, [metronomBpm]);

  // Update metronome volume in real-time
  useEffect(() => {
    if (MetronomeService.isRunning()) {
      MetronomeService.setVolume(metronomeVolume);
    }

  }, [metronomeVolume]);

  return null; // Return null instead of empty view to save a node
};

export default GlobalAudioPlayer;
