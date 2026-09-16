

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

// Add AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Firebase Mocks
jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => [{}]),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  requestPermission: jest.fn(),
  getToken: jest.fn().mockResolvedValue('mock-token'),
  deleteToken: jest.fn().mockResolvedValue(true),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  registerDeviceForRemoteMessages: jest.fn(),
  setBackgroundMessageHandler: jest.fn(),
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
}));

jest.mock('@react-native-firebase/crashlytics', () => {
  const recordErrorMock = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      recordError: recordErrorMock,
    })),
  };
});

// AdMob Mock
global.adCallbacks = {};
jest.mock('react-native-google-mobile-ads', () => {
  const mockRewarded = {
    addAdEventListener: jest.fn((event, callback) => {
      global.adCallbacks[event] = callback;
      return () => {
        if (global.adCallbacks[event] === callback) {
          delete global.adCallbacks[event];
        }
      };
    }),
    load: jest.fn(),
    show: jest.fn().mockResolvedValue(true),
  };
  return {
    __esModule: true,
    default: jest.fn(() => ({
      initialize: jest.fn().mockResolvedValue({}),
      setRequestConfiguration: jest.fn(),
    })),
    RewardedAd: {
      createForAdRequest: jest.fn(() => mockRewarded),
    },
    BannerAd: (props) => {
      const React = require('react');
      const { View } = require('react-native');
      return React.createElement(View, null);
    },
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'earned_reward',
    },
    AdEventType: {
      CLOSED: 'closed',
      ERROR: 'error',
    },
    AdsConsentDebugGeography: {
      DISABLED: 0,
      EEA: 1,
      NOT_EEA: 2,
    },
    TestIds: {
      REWARDED: 'mock-rewarded-id',
      ADAPTIVE_BANNER: 'mock-banner-id',
    },
    AdsConsent: {
      requestInfoUpdate: jest.fn().mockResolvedValue({
        isConsentFormAvailable: true,
        status: 'REQUIRED',
        canRequestAds: false,
      }),
      loadAndShowConsentFormIfRequired: jest.fn().mockResolvedValue({
        status: 'OBTAINED',
        canRequestAds: true,
      }),
      showPrivacyOptionsForm: jest.fn().mockResolvedValue({
        status: 'OBTAINED',
        canRequestAds: true,
      }),
      getConsentInfo: jest.fn().mockResolvedValue({
        canRequestAds: true,
        status: 'OBTAINED',
      }),
      getStatus: jest.fn().mockResolvedValue('REQUIRED'),
      showForm: jest.fn().mockResolvedValue({
        status: 'OBTAINED',
        canRequestAds: true,
      }),
      reset: jest.fn(),
    },
  };
});

// Bootsplash & Localize & Review
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(true),
  isVisible: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'tr', countryCode: 'TR' }],
}));

jest.mock('react-native-in-app-review', () => ({
  RequestInAppReview: jest.fn().mockResolvedValue(true),
  isAvailable: jest.fn(() => true),
}));

// Custom Native Sound Manager and Fullscreen mocks
import { NativeModules } from 'react-native';
NativeModules.NativeSoundManager = {
  play: jest.fn(),
  setVolume: jest.fn(),
  playMetronomeTick: jest.fn(),
  pauseAll: jest.fn(),
  resumeAll: jest.fn(),
  stopAll: jest.fn(),
  stop: jest.fn(),
};
NativeModules.NativeFullscreen = {
  enterImmersive: jest.fn(),
  exitImmersive: jest.fn(),
};
NativeModules.RNLocalize = {
  language: 'tr',
  languages: ['tr', 'en'],
};
