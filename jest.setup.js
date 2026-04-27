

jest.mock('react-native-track-player', () => ({
  setupPlayer: jest.fn(),
  updateOptions: jest.fn(),
  add: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  getState: jest.fn(),
  addEventListener: jest.fn(),
  registerPlaybackService: jest.fn(),
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
  State: {
    Playing: 'playing',
    Paused: 'paused',
    Stopped: 'stopped',
  }
}));

jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('@react-native-masked-view/masked-view', () => 'MaskedView');
