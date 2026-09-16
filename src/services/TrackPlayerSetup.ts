import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode, IOSCategory, IOSCategoryMode, IOSCategoryOptions } from 'react-native-track-player';
import { NativeModules, Platform } from 'react-native';

// iOS Polyfill for missing TrackPlayer method signatures in some 4.x versions
if (Platform.OS === 'ios' && NativeModules.TrackPlayerModule) {
  const missingMethods = [
    'getSleepTimerProgress',
    'setSleepTimer',
    'sleepWhenActiveTrackReachesEnd',
    'clearSleepTimer'
  ];

  missingMethods.forEach(method => {
    try {
      if (!NativeModules.TrackPlayerModule[method]) {
        NativeModules.TrackPlayerModule[method] = () => Promise.resolve();
      }
    } catch {
      // Ignore mutation errors on TurboModules
    }
  });
}

let setupPromise: Promise<void> | null = null;
let isSetupComplete = false;

export const isTrackPlayerSetupComplete = (): boolean => isSetupComplete;

export const setupTrackPlayer = (): Promise<void> => {
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    try {
      try {
        await TrackPlayer.setupPlayer({
          iosCategory: IOSCategory.Playback,
          iosCategoryMode: IOSCategoryMode.Default,
          iosCategoryOptions: [IOSCategoryOptions.MixWithOthers],
        });
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
            url: require('../../assets/sounds/ambiyans-music.m4a'),
            title: 'Calmix',
            isLiveStream: true,
            artwork: 'https://cdn-icons-png.flaticon.com/512/3039/3039401.png',
          },
        ]);

        // Loop the dummy track so it never ends and the foreground service stays active
        await TrackPlayer.setRepeatMode(RepeatMode.Track);
        // Mute TrackPlayer completely so this dummy track is completely silent
        await TrackPlayer.setVolume(0);
      }
      isSetupComplete = true;
    } catch (error) {
      console.warn('TrackPlayer Setup Error:', error);
      setupPromise = null;
      isSetupComplete = false;
    }
  })();

  return setupPromise;
};
