import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

let isSetup = false;

export const setupTrackPlayer = async () => {
  if (isSetup) return;

  try {
    console.log('Setting up TrackPlayer...');
    await TrackPlayer.setupPlayer();
    console.log('TrackPlayer setupPlayer success.');
    
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
    });

    // Add a silent dummy track to engage the foreground service and media session
    await TrackPlayer.add([
      {
        id: 'dummy',
        url: 'https://raw.githubusercontent.com/anars/blank-audio/master/250-milliseconds-of-silence.mp3',
        title: 'Sleep Sounds',
        artist: 'Mixer is active',
        artwork: 'https://cdn-icons-png.flaticon.com/512/3039/3039401.png',
      },
    ]);

    isSetup = true;
  } catch (error) {
    console.warn('TrackPlayer Setup Error:', error);
  }
};
