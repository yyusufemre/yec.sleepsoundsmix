

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  getState: jest.fn(),
  setVolume: jest.fn(),
  addEventListener: jest.fn(),
  registerPlaybackService: jest.fn(),
  setRepeatMode: jest.fn(),
  getQueue: jest.fn().mockResolvedValue([]),
  getActiveTrackIndex: jest.fn().mockResolvedValue(0),
  skip: jest.fn(),
  updateNowPlayingMetadata: jest.fn(),
  Event: {
    RemotePlay: 'RemotePlay',
    RemotePause: 'RemotePause',
    RemoteStop: 'RemoteStop',
  },
  Capability: {
    Play: 0,
    Pause: 1,
    Stop: 2,
  },
  AppKilledPlaybackBehavior: {
    StopPlaybackAndRemoveNotification: 'StopPlaybackAndRemoveNotification',
  },
  RepeatMode: {
    Off: 0,
    Track: 1,
    Queue: 2,
  },
  State: {
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
    None: 'none',
    Ended: 'ended',
  }
}));

jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('@react-native-masked-view/masked-view', () => 'MaskedView');
