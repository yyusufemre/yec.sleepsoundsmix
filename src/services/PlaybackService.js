import TrackPlayer, { Event } from 'react-native-track-player';
import useMixerStore from '../store/useMixerStore';

export const PlaybackService = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    useMixerStore.getState().setSystemPaused(false);
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    useMixerStore.getState().setSystemPaused(true);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    useMixerStore.getState().clearMix();
  });
};
