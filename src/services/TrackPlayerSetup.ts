import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode } from 'react-native-track-player';

let setupPromise: Promise<void> | null = null;

export const setupTrackPlayer = (): Promise<void> => {
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    try {
      try {
        await TrackPlayer.setupPlayer();
        console.log('TrackPlayer setupPlayer success.');
      } catch (setupError: any) {
        if (!(setupError?.message?.includes('already been initialized') || setupError?.code === 'player_already_initialized')) {
          throw setupError;
        }
        console.log('TrackPlayer already initialized. Updating options...');
      }
      
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
      });

      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        // Add a silent dummy track to engage the foreground service and media session
        await TrackPlayer.add([
          {
            id: 'dummy',
            url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/ambiyans-music.m4a',
            title: 'Uyku Sesleri',
            artist: 'Uyku sesleri açık',
            artwork: 'https://cdn-icons-png.flaticon.com/512/3039/3039401.png',
          },
        ]);
        
        // Loop the dummy track so it never ends and the foreground service stays active
        await TrackPlayer.setRepeatMode(RepeatMode.Track);
        // Mute TrackPlayer completely so this dummy track is completely silent
        await TrackPlayer.setVolume(0);
      }
    } catch (error) {
      console.warn('TrackPlayer Setup Error:', error);
      setupPromise = null;
    }
  })();

  return setupPromise;
};
