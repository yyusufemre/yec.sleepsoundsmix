import TrackPlayer, { Event } from 'react-native-track-player';
import useMixerStore from '../store/useMixerStore';
import NativeSoundManager from './NativeSoundManager';

export const PlaybackService = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    useMixerStore.getState().setSystemPaused(false);
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    useMixerStore.getState().setSystemPaused(true);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    // SPIKE: Anında native audio engine'e "tümünü sustur" emri veriyoruz!
    NativeSoundManager.stopAll();

    // Sadece notification/dummy session'ı temizle
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset(); // Agresif temizlik
    } catch (error) {
      console.warn('TrackPlayer stop/reset error:', error);
    }

    // Store update'lerini EN SONA bırak, böylece UI thread'i notification kapanışını geciktirmez.
    useMixerStore.getState().setSystemPaused(true);
    useMixerStore.getState().clearMix();
  });
};
